import React, { useState } from 'react';

const InputModal = ({ inputs, onRun, onClose }) => {
    // Initialize state with empty strings for each input
    const [values, setValues] = useState(
        inputs.reduce((acc, input) => ({ ...acc, [input]: '' }), {})
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert object to array of values in order
        const orderedValues = inputs.map(name => values[name]);
        onRun(orderedValues);
    };

    const handleChange = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Enter Program Inputs</h2>
                <p className="text-sm text-gray-600 mb-4">
                    This program requires the following inputs to run:
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {inputs.map((name) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Value for <span className="font-mono text-indigo-600">{name}</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={`Enter value for ${name}`}
                                value={values[name]}
                                onChange={(e) => handleChange(name, e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
                        >
                            Run Program
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputModal;
