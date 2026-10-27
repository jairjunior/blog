/****************************************************************************** 
/ Função para postar um comentário.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const commentTextArea = document.getElementById('commentTextArea');
            const commentContent = commentTextArea.value;
            const pathName = window.location.pathname;

            try {
                const response = await fetch(`${pathName}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ commentContent })
                });
                if (response.ok) {
                    commentTextArea.value = '';
                    location.reload();
                } else {
                    const responseData = await response.json();
                    console.error('Comment error: ', responseData.message);
                    const messageField = document.getElementById('responseMessage')
                    messageField.textContent = 'Erro ao registrar comentário.';
                }
            } catch (error) {
                console.error('Erro na requisição:\n', error);
            }
        });
    }
});