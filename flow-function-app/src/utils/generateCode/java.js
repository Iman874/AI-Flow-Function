export default function(pseudo) {
  return pseudo.split('\n').map(line => {
    if (line.startsWith('IF')) return 'if (condition) {';
    if (line.startsWith('RETURN')) return 'return value;';
    if (line.startsWith('DECLARE')) return 'int ' + line.replace('DECLARE', '') + ';';
    if (line.startsWith('LOOP')) return 'for (int i = 0; i < N; i++) {';
    if (line.startsWith('FUNCTION')) return 'void functionName() {';
    if (line.startsWith('PARAM')) return '// param';
    if (line.startsWith('PROCESS')) return '// process';
    if (line.startsWith('ELSE')) return '} else {';
    if (line.startsWith('READ')) return line.replace('READ', '').trim() + ' = scanner.nextInt();';
    if (line.startsWith('PRINT')) return 'System.out.println(' + line.replace('PRINT', '').trim() + ');';
    return '// ' + line;
  }).join('\n');
}
