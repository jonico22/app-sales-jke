import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVoiceSearch } from './useVoiceSearch';

const speechRecognitionInstances: MockSpeechRecognition[] = [];

class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = '';
    maxAlternatives = 1;
    onstart: ((event: Event) => void) | null = null;
    onresult: ((event: Event) => void) | null = null;
    onerror: ((event: Event & { error: string }) => void) | null = null;
    onend: ((event: Event) => void) | null = null;
    start = vi.fn();
    stop = vi.fn();

    constructor() {
        speechRecognitionInstances.push(this);
    }
}

describe('useVoiceSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        speechRecognitionInstances.length = 0;
        window.SpeechRecognition = MockSpeechRecognition as never;
        window.webkitSpeechRecognition = undefined;
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: true,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('keeps listening after a no-speech event and retries recognition', () => {
        const { result } = renderHook(() => useVoiceSearch());

        act(() => {
            result.current.startListening();
        });

        const speechRecognition = speechRecognitionInstances[0];

        act(() => {
            speechRecognition?.onstart?.(new Event('start'));
        });

        expect(result.current.status).toBe('listening');

        act(() => {
            speechRecognition?.onerror?.(Object.assign(new Event('error'), { error: 'no-speech' }));
            speechRecognition?.onend?.(new Event('end'));
        });

        expect(result.current.status).toBe('processing');
        expect(result.current.error).toBeNull();

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(speechRecognition?.start).toHaveBeenCalledTimes(2);
    });

    it('stops listening without retrying when the user cancels manually', () => {
        const { result } = renderHook(() => useVoiceSearch());
        const speechRecognition = speechRecognitionInstances[0];

        act(() => {
            result.current.startListening();
            speechRecognition?.onstart?.(new Event('start'));
        });

        expect(result.current.status).toBe('listening');

        act(() => {
            result.current.stopListening();
            speechRecognition?.onend?.(new Event('end'));
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.status).toBe('idle');
        expect(speechRecognition?.start).toHaveBeenCalledTimes(1);
        expect(speechRecognition?.stop).toHaveBeenCalledTimes(1);
    });

    it('commits the recognized transcript when the user stops listening manually', () => {
        const onFinalTranscript = vi.fn();
        const { result } = renderHook(() => useVoiceSearch({ onFinalTranscript }));
        const speechRecognition = speechRecognitionInstances[0];

        act(() => {
            result.current.startListening();
            speechRecognition?.onstart?.(new Event('start'));
            speechRecognition?.onresult?.(Object.assign(new Event('result'), {
                resultIndex: 0,
                results: [
                    {
                        isFinal: false,
                        0: { transcript: 'lapiz azul' },
                    },
                ],
            }));
        });

        act(() => {
            result.current.stopListening();
            speechRecognition?.onend?.(new Event('end'));
        });

        expect(onFinalTranscript).toHaveBeenCalledWith('lapiz azul');
        expect(result.current.transcript).toBe('lapiz azul');
        expect(result.current.status).toBe('idle');
    });

    it('preserves all final transcript chunks before completing', () => {
        const onFinalTranscript = vi.fn();
        const { result } = renderHook(() => useVoiceSearch({ onFinalTranscript }));
        const speechRecognition = speechRecognitionInstances[0];

        act(() => {
            result.current.startListening();
            speechRecognition?.onstart?.(new Event('start'));
            speechRecognition?.onresult?.(Object.assign(new Event('result'), {
                resultIndex: 0,
                results: [
                    {
                        isFinal: true,
                        0: { transcript: 'lapiz' },
                    },
                    {
                        isFinal: true,
                        0: { transcript: 'azul' },
                    },
                ],
            }));
            speechRecognition?.onend?.(new Event('end'));
        });

        expect(onFinalTranscript).toHaveBeenCalledWith('lapiz azul');
        expect(result.current.transcript).toBe('lapiz azul');
    });

    it('surfaces a friendly error when recognition start throws', () => {
        const { result } = renderHook(() => useVoiceSearch());
        const speechRecognition = speechRecognitionInstances[0];

        speechRecognition.start.mockImplementationOnce(() => {
            throw new Error('failed to start');
        });

        act(() => {
            result.current.startListening();
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error).toBe('No pudimos iniciar el microfono. Verifica el permiso e intentalo de nuevo.');
    });

    it('maps network recognition errors to an actionable message', () => {
        const { result } = renderHook(() => useVoiceSearch());
        const speechRecognition = speechRecognitionInstances[0];

        act(() => {
            result.current.startListening();
            speechRecognition?.onerror?.(Object.assign(new Event('error'), { error: 'network' }));
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error).toBe(
            'No se pudo conectar con el servicio de reconocimiento de voz. Verifica tu conexion e intentalo de nuevo.',
        );
    });

    it('reports the secure-context requirement only when support checks fail before start', () => {
        Object.defineProperty(window, 'isSecureContext', {
            configurable: true,
            value: false,
        });

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                hostname: 'staging.example.com',
            },
        });

        const { result } = renderHook(() => useVoiceSearch());

        act(() => {
            result.current.startListening();
        });

        expect(result.current.status).toBe('unsupported');
        expect(result.current.error).toBe('La busqueda por voz requiere un sitio seguro (HTTPS o localhost).');
    });
});
