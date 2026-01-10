import React from 'react';

const TerminalOutput = ({ output, error, isRunning }) => {
    return (
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
            {isRunning ? (
                <div className="text-yellow-400">
                    <span className="animate-pulse">Running...</span>
                </div>
            ) : (
                <>
                    {output && (
                        <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
                    )}
                    {error && (
                        <pre className="text-red-400 whitespace-pre-wrap mt-2">{error}</pre>
                    )}
                    {!output && !error && (
                        <div className="text-gray-500">No output yet. Click "Run" to execute code.</div>
                    )}
                </>
            )}
        </div>
    );
};

export default TerminalOutput;
