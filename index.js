const express = require('express');
const morgan = require('morgan');
const { swaggerUi, specs } = require('./swagger'); // Importe a configuração do Swagger
const app = express();
const port = 3000;

// Middleware para parsing de parâmetros de consulta
app.use(express.json());

// Configuração personalizada do morgan para incluir o IP do cliente
morgan.format('custom', ':remote-addr :method :url :status :response-time ms');
app.use(morgan('custom')); // Usa o formato personalizado para o log

// Rota para a documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Endpoint de cálculo
/**
 * @openapi
 * /calculate:
 *   get:
 *     summary: Realiza um cálculo simples
 *     parameters:
 *       - name: num1
 *         in: query
 *         description: Primeiro número
 *         required: true
 *         schema:
 *           type: number
 *       - name: num2
 *         in: query
 *         description: Segundo número
 *         required: true
 *         schema:
 *           type: number
 *       - name: operation
 *         in: query
 *         description: Operação matemática a ser realizada
 *         required: true
 *         schema:
 *           type: string
 *           enum: [+, -, x, /]  # Define os valores possíveis para operação
 *     responses:
 *       200:
 *         description: Resultado do cálculo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: number
 *       400:
 *         description: Erro na solicitação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/calculate', (req, res, next) => {
    try {
        const { num1, num2, operation } = req.query;

        // Decodifica o parâmetro 'operation' para tratar caracteres especiais
        const decodedOperation = decodeURIComponent(operation).replace(/\s+/g, '+');

        // Verifica o valor do parâmetro 'operation' recebido
        console.log(`Received operation: '${operation}'`);
        console.log(`Decoded operation: '${decodedOperation}'`);

        // Verifica se todos os parâmetros estão presentes
        if (num1 === undefined || num2 === undefined || decodedOperation === undefined) {
            throw new Error('Parâmetros insuficientes!');
        }

        // Converte os parâmetros para números
        const number1 = parseFloat(num1);
        const number2 = parseFloat(num2);

        // Verifica se os parâmetros são números válidos
        if (isNaN(number1) || isNaN(number2)) {
            throw new Error('Parâmetros inválidos!');
        }

        let result;

        // Realiza a operação baseada no parâmetro 'operation'
        switch (decodedOperation) {
            case 'add':
                result = number1 + number2;
                break;
            case 'subtract':
                result = number1 - number2;
                break;
            case 'multiply':
                result = number1 * number2;
                break;
            case 'divide':
                if (number2 === 0) {
                    throw new Error('Divisão por zero não é permitida!');
                }
                result = number1 / number2;
                break
            case 'par':
                result = `${number1} é ${number1 % 2 === 0 ? "par" : "impar"} e ${number2} é ${number2 % 2 === 0 ? "par" : "impar"}`;
  
                break;
            default:
                throw new Error('Operação inválida!');
        }

        res.json({ result });
    } catch (error) {
        next(error); // Passa o erro para o middleware de tratamento
    }
});

app.get('/imc', (req, res, next) => {
    try {
        const { altura, peso} = req.query;

 

        // Verifica se todos os parâmetros estão presentes
        if (altura === undefined || peso === undefined) {
            throw new Error('Parâmetros insuficientes!');
        }

        // Converte os parâmetros para números
        const altnum = parseFloat(altura)/100;
        const pesnum = parseFloat(peso);

        // Verifica se os parâmetros são números válidos
        if (isNaN(altnum) || isNaN(pesnum)) {
            throw new Error('Parâmetros inválidos!');
        }

        
        let imc1;
        imc1= pesnum/(altnum * altnum);

        let result;
        if (imc1 < 16.9) {
            result = `${imc1.toFixed(2)}: Muito abaixo do peso.`;
        } else if (imc1 >= 17 && imc1 <= 18.4) {
            result = `${imc1.toFixed(2)}: Abaixo do peso.`;
        } else if (imc1 >= 18.5 && imc1 <= 24.9) {
            result = `${imc1.toFixed(2)}: Peso normal.`;
        } else if (imc1 >= 25 && imc1 <= 29.9) {
            result = `${imc1.toFixed(2)}: Acima do peso.`;
        } else if (imc1 >= 30 && imc1 <= 34.9) {
            result = `${imc1.toFixed(2)}: Obesidade grau I.`;
        } else if (imc1 >= 35 && imc1 <= 40) {
            result = `${imc1.toFixed(2)}: Obesidade grau II.`;
        } else {
            result = `${imc1.toFixed(2)}: Obesidade grau III.`;
        }

        res.json({ result });
    } catch (error) {
        next(error); // Passa o erro para o middleware de tratamento
    }
});





// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack); // Log do erro
    res.status(400).json({ error: err.message }); // Responde com a mensagem de erro
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});