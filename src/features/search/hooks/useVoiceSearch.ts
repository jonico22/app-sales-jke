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

const getVoiceSearchSupportIssue = (): string | null => {
    if (typeof window === 'undefined') {
        return 'La busqueda por voz no esta disponible en este entorno.';
    }

    if (!getRecognitionConstructor()) {
        return 'Este navegador no soporta busqueda por voz.';
    }

    if (window.isSecureContext || isLocalhost(window.location.hostname)) {
        return null;
    }

    return 'La busqueda por voz requiere un sitio seguro (HTTPS o localhost).';
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
            return 'No se pudo conectar con el servicio de reconocimiento de voz. Verifica tu conexion e intentalo de nuevo.';
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
    const latestTranscriptRef = useRef('');
    const shouldResumeRef = useRef(false);
    const shouldRestartRef = useRef(false);
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const supportIssue = getVoiceSearchSupportIssue();

    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<VoiceSearchStatus>(() =>
        supportIssue ? 'unsupported' : 'idle'
    );

    const isSupported = status !== 'unsupported';
    const isListening = status === 'listening' || status === 'processing';

    const mergeTranscript = useCallback((current: string, next: string) => {
        const normalizedCurrent = current.trim();
        const normalizedNext = next.trim();

        if (!normalizedNext) return normalizedCurrent;
        if (!normalizedCurrent) return normalizedNext;

        return `${normalizedCurrent} ${normalizedNext}`.trim();
    }, []);

    useEffect(() => {
        const nextSupportIssue = getVoiceSearchSupportIssue();

        if (nextSupportIssue) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('unsupported');
            setError(current => current ?? nextSupportIssue);
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
            latestTranscriptRef.current = '';
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
                    finalTranscriptRef.current = mergeTranscript(finalTranscriptRef.current, chunk);
                } else {
                    interimTranscript = mergeTranscript(interimTranscript, chunk);
                }
            }

            const nextTranscript = mergeTranscript(finalTranscriptRef.current, interimTranscript);
            latestTranscriptRef.current = nextTranscript;
            setTranscript(nextTranscript);
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
            const finalTranscript = (finalTranscriptRef.current.trim() || latestTranscriptRef.current.trim());

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
        const nextSupportIssue = getVoiceSearchSupportIssue();

        if (nextSupportIssue) {
            setStatus('unsupported');
            setError(nextSupportIssue);
            return;
        }

        if (!recognitionRef.current) {
            setStatus('unsupported');
            setError('No pudimos inicializar la busqueda por voz. Recarga la pagina e intentalo de nuevo.');
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
        shouldEmitFinalRef.current = Boolean(
            finalTranscriptRef.current.trim() || latestTranscriptRef.current.trim()
        );
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
        latestTranscriptRef.current = '';
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
