const express = require('express');
const { Web3 } = require('web3');
const { abi, networks } = require('./build/contracts/RegCertificado.json');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const port = 3000;

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const web3 = new Web3(provider);

const networkId = "5777";
const contratoAddress = networks[networkId]?.address;

if (!contratoAddress) {
    throw new Error(`Contrato não implantado na rede especificada (networkId: ${networkId}).`);
}

const contrato = new web3.eth.Contract(abi, contratoAddress);

function stringifyBigInt(obj) {
    return JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
}

app.post('/certificate', async (req, res) => {
    const { action, id, nomeAluno, curso, emissao } = req.body;
    const accounts = await web3.eth.getAccounts();

    try {
        if (action === 'register') {
            await contrato.methods.registrar(id, nomeAluno, curso, emissao)
                .send({ from: accounts[0], gas: 500000 });
            res.json({ message: 'Certificado registrado !' });
        } else if (action === 'get') {
            const certificate = await contrato.methods.ver_certificado(id).call();
            const result = stringifyBigInt({
                id: certificate[0],
                nomeAluno: certificate[1],
                curso: certificate[2],
                emissao: certificate[3],
                valido: certificate[4]
            });
            res.json(result);
        } else if (action === 'revoke') {
            await contrato.methods.revogar(id)
                .send({ from: accounts[0], gas: 500000 });
            res.json({ message: 'Certificado revogado ' });
        } else {
            res.status(400).json({ error: 'Ação inválida.' });
        }
    } catch (error) {
        console.error("Erro na ação:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/certificates', async (req, res) => {
    try {
        const ids = await contrato.methods.getAllCertificateIds().call();
        const certificates = await Promise.all(
            ids.map(async (id) => {
                const certificate = await contrato.methods.ver_certificado(id).call();
                return {
                    id: certificate[0].toString(), 
                    valido: certificate[4]         
                };
            })
        );
        res.json(certificates);
    } catch (error) {
        console.error("Erro na listagem de certificados:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor funcionando em http://localhost:${port}`);
});
