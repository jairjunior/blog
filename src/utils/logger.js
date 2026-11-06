const stackTrace = require('stacktrace-parser');

/*****************************************************************************
/ Função para formatar e printar erros no console com rastreio.
/*****************************************************************************/
// const printConsoleError = (error) => {
//     try {
//         // Usa a stack do próprio erro recebido (ou gera um novo se não houver)
//         const targetError = error instanceof Error ? error : new Error(String(error));
//         const parsedStack = stackTrace.parse(targetError.stack);

//         // O parsedStack retorna um array de "frames" (linhas da pilha de execução).
//         // O primeiro item útil (índice 0 ou 1) geralmente representa onde o erro/catch ocorreu.
//         // Vamos pegar o primeiro frame válido que não pertença a este próprio arquivo de log.
//         const callerFrame = parsedStack.find(frame => 
//             frame.file && !frame.file.includes('printConsoleError')
//         ) || parsedStack[0];

//         const functionName = callerFrame.methodName || 'anonymous';
//         let fileName = callerFrame.file || 'unknown';
//         const lineNumber = callerFrame.lineNumber || '?';
//         const columnNumber = callerFrame.column || '?';

//         // Opcional: Remove o caminho absoluto do projeto para exibir um path relativo mais limpo
//         if (fileName.includes(process.cwd())) {
//             fileName = fileName.replace(process.cwd(), '').replace(/^[/\\]/, '');
//         }

//         console.error(`\n--------------------------------------------------`);
//         console.error(`❌ ERROR in [${functionName}] at (${fileName}:${lineNumber}:${columnNumber})`);
//         console.error(`--------------------------------------------------`);
//         console.error(targetError);
//         console.error(`--------------------------------------------------\n`);

//     } catch (err) {
//         // Fallback de segurança caso ocorra qualquer imprevisto no parsing
//         console.error('ERROR (fallback stack trace failed):\n', error);
//     }
// };



/*****************************************************************************
/ Função auxiliar para printar erros no console do servidor
/*****************************************************************************/
function printConsoleError(error){
    const myError = new Error();
    const stack = stackTrace.parse(myError.stack);
    const callerLine = stack[1];
    const functionName = callerLine.methodName || 'anonymous';
    const lineNumber = callerLine.lineNumber || '?';
    var pathName = callerLine.file || 'unknown';
    var className = undefined;

    if(pathName !== 'unknown'){
        const pathNameParts = pathName.split('/');
        const fileName = pathNameParts.at(-1);
        className = fileName.split('.')[0];
    }

    console.error('\n------------------------------------------------------------')
    console.error(`❌ ERROR in ${className}.${functionName}() at line ${lineNumber}.`);
    console.error('------------------------------------------------------------')
    console.error(error);
    console.error(`------------------------------------------------------------\n`);
}


module.exports = {
    printConsoleError
};