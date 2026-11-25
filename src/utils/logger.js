const stackTrace = require('stacktrace-parser');

/******************************************************************************
 * Função interna para formatação centralizada de logs no console.
 * 
 * Sanitiza as entradas, removendo \r e \n das strings antes da impressão.
 *****************************************************************************/
function writeLog({ level, icon, stream, header, content }) {
    const { className, functionName, lineNumber } = getFunctionCallerInfo();
    const timestamp = getTimestamp();
    const output = stream === 'stderr' ? console.error : console.log;
    const safeContent = sanitizeForLog(typeof content === 'string' ? content : String(content));
    output(`\n------------------------------------------------------ ${header} ------------------------------------------------------`);
    output(`${icon} [${timestamp}] ${sanitizeForLog(level)} in ${className}.${functionName}() at line ${lineNumber}.`);
    output(safeContent);
    output(`---------------------------------------------------------------------------------------------------------------------------`);
}


/******************************************************************************
 * Função para imprimir Erros no console do servidor.
 *****************************************************************************/
function printConsoleError(event = 'SYS_ERROR', error) {
    writeLog({
        level: event,
        icon: '❌ ',
        stream: 'stderr',
        header: 'ERROR',
        content: error
    });
}


/******************************************************************************
 * Função para imprimir Blocks no console do servidor.
 *****************************************************************************/
function printRateLimitBlock(event, message) {
    writeLog({
        level: event,
        icon: '🚨 ',
        stream: 'stderr',
        header: 'BLOCK',
        content: `MESSAGE: ${message}`
    });
}


/******************************************************************************
 * Função para imprimir Warnings no console do servidor.
 *****************************************************************************/
function printConsoleWarning(event, message) {
    writeLog({
        level: event,
        icon: '⚠️ ',
        stream: 'stderr',
        header: 'WARNING',
        content: `MESSAGE: ${message}`
    });
}


/******************************************************************************
 * Função para imprimir registros de Auditoria de Segurança no console 
 * do servidor.
 *****************************************************************************/
function printSecurityAudit(event, message) {
    writeLog({
        level: event,
        icon: '🛡️ ',
        stream: 'stdout',
        header: 'SECURITY AUDIT',
        content: `MESSAGE: ${message}`
    });
}


/******************************************************************************
 * Função auxiliar para sanitizar as strings que serão imprimidas no console.
 *****************************************************************************/
function sanitizeForLog(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[\r\n]/g, ' ');
}


/******************************************************************************
 * Função auxiliar que obtém dados da função que lançou o erro.
 *****************************************************************************/
function getFunctionCallerInfo(){
    const myError = new Error();
    const stack = stackTrace.parse(myError.stack);
    //console.error('Stacktrace:\n', stack)
    const callerLine = stack[3];
    const functionName = callerLine.methodName.split('.').at(-1) || 'anonymous';
    const lineNumber = callerLine.lineNumber || '?';
    let pathName = callerLine.file || 'unknown';
    let className = 'unknown';

    if(pathName !== 'unknown'){
        const pathNameParts = pathName.split('/');
        const fileName = pathNameParts.at(-1);
        className = fileName.split('.')[0];
    }

    return {className, functionName, lineNumber};
}


/******************************************************************************
 * Função auxiliar que retorna a data e hora atuais.
 *****************************************************************************/
function getTimestamp() {
    return new Date().toISOString();
}


/******************************************************************************
 * Exporta funções para serem utilizadas em outros arquivos.
 *****************************************************************************/
module.exports = {
    printConsoleError,
    printConsoleWarning,
    printSecurityAudit,
    printRateLimitBlock
};