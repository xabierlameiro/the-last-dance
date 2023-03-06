import React, { useState, useEffect } from 'react';

/**
 * @description Component to record audio from browser microphone and buttons to control the recording start, stop and play
 * @returns JSX.Element
 */

const Test = () => {
    const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
    const [audio, setAudio] = useState<Blob | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        if (audio) {
            setAudioURL(URL.createObjectURL(audio));
        }
    }, [audio]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            setRecorder(mediaRecorder);
            setIsRecording(true);
            mediaRecorder.ondataavailable = (e) => {
                setAudio(e.data);
            };
        } catch (error) {
            console.log(error);
        }
    };

    const stopRecording = () => {
        if (recorder) {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const playAudio = () => {
        if (audioURL) {
            const audio = new Audio(audioURL);
            audio.play();
            setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
            };
        }
    };

    return (
        <div>
            <button onClick={startRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
                Stop Recording
            </button>
            <button onClick={playAudio} disabled={isPlaying}>
                Play Audio
            </button>
        </div>
    );
};

export default Test;
