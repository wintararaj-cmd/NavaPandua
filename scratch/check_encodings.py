import os

def check_files(directory):
    for root, dirs, files in os.walk(directory):
        if 'venv' in dirs:
            dirs.remove('venv')
        if '.git' in dirs:
            dirs.remove('.git')
        if '__pycache__' in dirs:
            dirs.remove('__pycache__')
            
        for file in files:
            if file.endswith(('.py', '.txt', '.md', '.json', '.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'rb') as f:
                        content = f.read()
                        content.decode('utf-8')
                except UnicodeDecodeError as e:
                    print(f"Non-UTF8 file found: {filepath}")
                    print(f"Error: {e}")

if __name__ == "__main__":
    check_files('.')
