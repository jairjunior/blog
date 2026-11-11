const stackTrace = require('stacktrace-parser');

/*****************************************************************************
/ Função para imprimir Erros no console do servidor.
/*****************************************************************************/
function printConsoleError(error){
    const myError = new Error();
    const stack = stackTrace.parse(myError.stack);
    const callerLine = stack[1];
    const functionName = callerLine.methodName || 'anonymous';
    const lineNumber = callerLine.lineNumber || '?';
    var pathName = callerLine.file || 'unknown';
    var className = undefined;
    const timestamp = getTimestamp();

    if(pathName !== 'unknown'){
        const pathNameParts = pathName.split('/');
        const fileName = pathNameParts.at(-1);
        className = fileName.split('.')[0];
    }

    console.error('\n------------------------------------------------------------')
    console.error(`❌ [${timestamp}] ERROR in ${className}.${functionName}() at line ${lineNumber}.`);
    console.error('------------------------------------------------------------')
    console.error(error);
    console.error(`------------------------------------------------------------\n`);
}


/*****************************************************************************
/ Função para imprimir Warnings no console do servidor.
/*****************************************************************************/
function printConsoleWarning(warning){
    const myError = new Error();
    const stack = stackTrace.parse(myError.stack);
    const callerLine = stack[1];
    const functionName = callerLine.methodName || 'anonymous';
    const lineNumber = callerLine.lineNumber || '?';
    var pathName = callerLine.file || 'unknown';
    var className = undefined;
    const timestamp = getTimestamp();

    if(pathName !== 'unknown'){
        const pathNameParts = pathName.split('/');
        const fileName = pathNameParts.at(-1);
        className = fileName.split('.')[0];
    }

    console.error('\n------------------------------------------------------------')
    console.error(`⚠️ [${timestamp}] WARNING in ${className}.${functionName}() at line ${lineNumber}.`);
    console.error('------------------------------------------------------------')
    console.error(warning);
    console.error(`------------------------------------------------------------\n`);
}


/*****************************************************************************/
// Função auxiliar para imprimir no console quando um usuário/IP é bloqueado.
// Via de regra, será utilizada pelo pacote express-rate-limit.
/*****************************************************************************/
function printRateLimitBlock(email, clientIp, originalUrl){
    const timestamp = getTimestamp();
    console.error(`\n------------------------------------------------------------------------------------------------------------------------`);
    console.error(`🚨 [${timestamp}] [RATE LIMIT EXCEED] Block triggered for email: [${email}] originating from IP/Network: [${clientIp}] on route: [${originalUrl}]`);
    console.error(`------------------------------------------------------------------------------------------------------------------------\n`);
}


/*****************************************************************************/
// Função auxiliar que retorna a data e hora atuais.
/*****************************************************************************/
function getTimestamp() {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'medium'
    });
}


/*****************************************************************************/
// Exporta funções para serem utilizadas em outros arquivos.
/*****************************************************************************/
module.exports = {
    printConsoleError,
    printConsoleWarning,
    printRateLimitBlock
};