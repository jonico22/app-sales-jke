import { useCallback, useEffect, useRef, useState } from 'react';

type VoiceSearchStatus = 'idle' | 'unsupported' | 'listening' | 'processing' | 'error';

interface SpeechRecognitionAlternativeLike {
    transcript: string;
}

interface SpeechRecognitionResultLike {
    isFinal: boolean;
    0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
    error: string;
}

interface SpeechRecognitionLike extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: ((event: Event) => void) | null;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: ((event: Event) => void) | null;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionConstructorLike {
    new (): SpeechRecognitionLike;
}

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructorLike;
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    }
}

const getRecognitionConstructor = (): SpeechRecognitionConstructorLike | null => {
    if (typeof window === 'undefined') return null;

    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const isLocalhost = (hostname: string): boolean =>
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const canUseVoiceSearch = (): boolean => {
    if (typeof window === 'undefined') return false;

    const hasRecognition = Boolean(getRecognitionConstructor());
    if (!hasRecognition) return false;

    if (window.isSecureContext) return true;

    return isLocalhost(window.location.hostname);
};

const mapRecognitionError = (error: string): string => {
    switch (error) {
        case 'not-allowed':
        case 'service-not-allowed':
            return 'No se concedio permiso para usar el microfono.';
        case 'audio-capture':
            return 'No se detecto ningun microfono disponible.';
        case 'no-speech':
            return 'No detectamos voz. Intenta nuevamente.';
        case 'aborted':
            return 'La escucha fue cancelada.';
        case 'network':
            return 'La busqueda por voz necesita una conexion valida y un sitio seguro (HTTPS o localhost).';
        case 'language-not-supported':
            return 'El idioma configurado para la busqueda por voz no es compatible en este navegador.';
        case 'bad-grammar':
            return 'La configuracion de reconocimiento de voz no es valida.';
        default:
            return 'No se pudo completar la busqueda por voz.';
    }
};

export interface UseVoiceSearchOptions {
    lang?: string;
    onFinalTranscript?: (transcript: string) => void;
}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}) {
    const { lang = 'es-PE', onFinalTranscript } = options;
    const restartDelayMs = 1000;
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const shouldEmitFinalRef = useRef(false);
    const finalTranscriptRef = useRef('');
    const shouldResumeRef = useRef(false);
    const shouldRestartRef = useRef(false);
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<VoiceSearchStatus>(() =>
        canUseVoiceSearch() ? 'idle' : 'unsupported'
    );

    const isSupported = status !== 'unsupported';
    const isListening = status === 'listening' || status === 'processing';

    useEffect(() => {
        if (!canUseVoiceSearch()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('unsupported');
            return;
        }

        const SpeechRecognitionCtor = getRecognitionConstructor();
        if (!SpeechRecognitionCtor) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('unsupported');
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = lang;
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        const clearRestartTimeout = () => {
            if (!restartTimeoutRef.current) return;

            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        };

        const scheduleRestart = () => {
            if (!shouldResumeRef.current || !recognitionRef.current) return;

            clearRestartTimeout();
            setStatus('processing');
            restartTimeoutRef.current = setTimeout(() => {
                restartTimeoutRef.current = null;

                if (!shouldResumeRef.current || !recognitionRef.current) return;

                try {
                    recognitionRef.current.start();
                } catch {
                    // Some browsers briefly reject restart attempts while tearing
                    // down the previous session. Keep the voice session alive and retry.
                    shouldRestartRef.current = true;
                    scheduleRestart();
                }
            }, restartDelayMs);
        };

        recognition.onstart = () => {
            clearRestartTimeout();
            setError(null);
            setTranscript('');
            finalTranscriptRef.current = '';
            shouldEmitFinalRef.current = true;
            shouldRestartRef.current = false;
            setStatus('listening');
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i];
                const chunk = result[0]?.transcript?.trim() || '';

                if (!chunk) continue;

                if (result.isFinal) {
                    finalTranscriptRef.current = chunk;
                } else {
                    interimTranscript = chunk;
                }
            }

            setTranscript(finalTranscriptRef.current || interimTranscript);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                shouldRestartRef.current = true;
                return;
            }

            const nextError = mapRecognitionError(event.error);
            shouldEmitFinalRef.current = false;

            if (event.error !== 'aborted') {
                shouldResumeRef.current = false;
            }

            setError(nextError);
            setStatus(event.error === 'aborted' ? 'idle' : 'error');
        };

        recognition.onend = () => {
            const finalTranscript = finalTranscriptRef.current.trim();

            if (shouldEmitFinalRef.current && finalTranscript) {
                shouldResumeRef.current = false;
                onFinalTranscript?.(finalTranscript);
                setTranscript(finalTranscript);
                setStatus('idle');
                return;
            }

            if (shouldResumeRef.current && !finalTranscript) {
                shouldRestartRef.current = true;
            }

            if (shouldRestartRef.current) {
                scheduleRestart();
                return;
            }

            setStatus(current => (current === 'listening' ? 'idle' : current));
        };

        recognitionRef.current = recognition;

        return () => {
            shouldEmitFinalRef.current = false;
            shouldResumeRef.current = false;
            shouldRestartRef.current = false;
            clearRestartTimeout();
            recognition.onstart = null;
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            recognition.stop();
            recognitionRef.current = null;
        };
    }, [lang, onFinalTranscript]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            setStatus('unsupported');
            setError('La busqueda por voz requiere un navegador compatible y un sitio seguro (HTTPS o localhost).');
            return;
        }

        setError(null);
        shouldResumeRef.current = true;
        shouldRestartRef.current = false;
        setStatus('processing');

        try {
            recognitionRef.current.start();
        } catch {
            shouldResumeRef.current = false;
            shouldRestartRef.current = false;
            setError('No pudimos iniciar el microfono. Verifica el permiso e intentalo de nuevo.');
            setStatus('error');
        }
    }, []);

    const stopListening = useCallback(() => {
        shouldEmitFinalRef.current = false;
        shouldResumeRef.current = false;
        shouldRestartRef.current = false;
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }
        recognitionRef.current?.stop();
        setStatus('idle');
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        finalTranscriptRef.current = '';
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        error,
        status,
        startListening,
        stopListening,
        resetTranscript,
    };
}
