import { useState } from 'react';
import { fetchWithFallback, getCurrentBaseUrl } from '../utils/apiClient';

export const useCodeExecution = () => {
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [executionTime, setExecutionTime] = useState(0);

    const executeCode = async (code, inputs = []) => {
        setIsRunning(true);
        setOutput('');
        setError(null);
        setExecutionTime(0);

        try {
            const response = await fetchWithFallback('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, inputs }),
            });

            const data = await response.json();

            if (data.success) {
                setOutput(data.output);
                setError(null);
            } else {
                setOutput(data.output || '');
                setError(data.error);
            }

            setExecutionTime(data.execution_time);
        } catch (err) {
            setError(`Failed to connect to backend: ${err.message}\n\nMake sure Flask server is running on ${getCurrentBaseUrl()}`);
        } finally {
            setIsRunning(false);
        }
    };

    const clearOutput = () => {
        setOutput('');
        setError(null);
        setExecutionTime(0);
    };

    return {
        output,
        error,
        isRunning,
        executionTime,
        executeCode,
        clearOutput,
    };
};
