const stackTrace = require('stacktrace-parser');

/*****************************************************************************
/ Função para imprimir Erros no console do servidor.
/*****************************************************************************/
function printConsoleError(error){
    const {className, functionName, lineNumber} = getFunctionCallerInfo();
    const timestamp = getTimestamp();

    console.error(`\n-----------------------------------------------------------ERROR ----------------------------------------------------------`);
    console.error(`❌ [${timestamp}] ERROR in ${className}.${functionName}() at line ${lineNumber}.`);
    console.error(error);
    console.error(`---------------------------------------------------------------------------------------------------------------------------`);
}


/*****************************************************************************
/ Função para imprimir Warnings no console do servidor.
/*****************************************************************************/
function printConsoleWarning(warning){   
    const {className, functionName, lineNumber} = getFunctionCallerInfo();
    const timestamp = getTimestamp();

    console.error(`\n----------------------------------------------------------WARNING----------------------------------------------------------`);
    console.error(`⚠️  [${timestamp}] WARNING in ${className}.${functionName}() at line ${lineNumber}.`);
    console.error('MESSAGE: ', warning);
    console.error(`---------------------------------------------------------------------------------------------------------------------------`);
}


/*****************************************************************************/
// Função auxiliar para imprimir no console quando um usuário/IP é bloqueado.
// Via de regra, será utilizada pelo pacote express-rate-limit.
/*****************************************************************************/
function printRateLimitBlock(email, clientIp, originalUrl){
    const {className, functionName, lineNumber} = getFunctionCallerInfo();
    const timestamp = getTimestamp();

    console.error(`\n------------------------------------------------------------------------------------------------------------------------`);
    console.error(`🚨 [${timestamp}] RATE LIMIT EXCEED in ${className}.${functionName}() at line ${lineNumber}.`);
    console.error(`MESSAGE: Block triggered for email: [${email}] originating from IP/Network: [${clientIp}] on route: [${originalUrl}]`);
    console.error(`------------------------------------------------------------------------------------------------------------------------`);
}


/*****************************************************************************/
// Função auxiliar que dados da função que lançou o erro.
/*****************************************************************************/
function getFunctionCallerInfo(){
    const myError = new Error();
    const stack = stackTrace.parse(myError.stack);
    //console.error('Stacktrace:\n', stack)//DEBUG
    const callerLine = stack[2];
    const functionName = callerLine.methodName.split('.').at(-1) || 'anonymous';
    const lineNumber = callerLine.lineNumber || '?';
    var pathName = callerLine.file || 'unknown';
    var className = undefined;

    if(pathName !== 'unknown'){
        const pathNameParts = pathName.split('/');
        const fileName = pathNameParts.at(-1);
        className = fileName.split('.')[0];
    }

    return {className, functionName, lineNumber};
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