export default function(pseudo) {
  // Simple mapping: IF -> if, RETURN -> return, DECLARE -> variable
  return pseudo.split('\n').map(line => {
    if (line.startsWith('IF')) return 'if condition:';
    if (line.startsWith('RETURN')) return 'return value';
    if (line.startsWith('DECLARE')) return '# ' + line.replace('DECLARE', '');
    if (line.startsWith('LOOP')) return 'for i in range(...):';
    if (line.startsWith('FUNCTION')) return 'def function_name():';
    if (line.startsWith('PARAM')) return '# param';
    if (line.startsWith('PROCESS')) return '# process';
    if (line.startsWith('ELSE')) return 'else:';
    if (line.startsWith('READ')) return `${line.replace('READ', '').trim()} = input()`;
    if (line.startsWith('PRINT')) return `print(${line.replace('PRINT', '').trim()})`;
    return '# ' + line;
  }).join('\n');
}
