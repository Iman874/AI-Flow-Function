from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

@app.route('/api/execute', methods=['POST'])
def execute_code():
    """
    Execute Python code and return output
    
    Request body:
    {
        "code": "print('Hello')",
        "inputs": ["input1", "input2"]  // Optional
    }
    
    Response:
    {
        "success": true,
        "output": "Hello\n",
        "error": null,
        "execution_time": 0.023
    }
    """
    try:
        data = request.json
        code = data.get('code', '')
        inputs = data.get('inputs', [])
        
        if not code:
            return jsonify({
                'success': False,
                'output': '',
                'error': 'No code provided',
                'execution_time': 0
            }), 400
        
        # Create temporary file for code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Prepare input string
            input_str = '\n'.join(inputs) if inputs else ''
            
            # Execute code with timeout
            start_time = time.time()
            result = subprocess.run(
                ['python', temp_file],
                input=input_str,
                capture_output=True,
                text=True,
                timeout=5  # 5 second timeout
            )
            execution_time = time.time() - start_time
            
            # Check for errors
            if result.returncode != 0:
                return jsonify({
                    'success': False,
                    'output': result.stdout,
                    'error': result.stderr,
                    'execution_time': execution_time
                })
            
            return jsonify({
                'success': True,
                'output': result.stdout,
                'error': None,
                'execution_time': execution_time
            })
            
        except subprocess.TimeoutExpired:
            return jsonify({
                'success': False,
                'output': '',
                'error': 'Execution timeout (5 seconds exceeded)',
                'execution_time': 5.0
            })
        
        finally:
            # Clean up temp file
            if os.path.exists(temp_file):
                os.remove(temp_file)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'output': '',
            'error': str(e),
            'execution_time': 0
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
