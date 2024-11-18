// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

contract RegCertificado {
    
    struct Certificate {
        uint id;
        string nomeAluno;
        string curso;
        string emissao;
        bool valido;
    }

    mapping(uint => Certificate) public certificates;
    uint[] public certificateIds;

    event CertificateRegistered(uint id, string nomeAluno, string curso, string emissao);
    event CertificateRevoked(uint id);

    function registrar(uint _id, string memory _nomeAluno, string memory _course, string memory _emissao) public {
        require(certificates[_id].id == 0, "Certificate ID already exists.");
        
        certificates[_id] = Certificate({
            id: _id,
            nomeAluno: _nomeAluno,
            curso: _course,
            emissao: _emissao,
            valido: true
        });

        certificateIds.push(_id);

        emit CertificateRegistered(_id, _nomeAluno, _course, _emissao);
    }

    function ver_certificado(uint _id) public view returns (uint, string memory, string memory, string memory, bool) {
        Certificate memory cert = certificates[_id];
        require(cert.id != 0, "Certificate does not exist.");
        
        return (cert.id, cert.nomeAluno, cert.curso, cert.emissao, cert.valido);
    }
    
    function revogar(uint _id) public {
        Certificate storage cert = certificates[_id];
        require(cert.id != 0, "Certificate does not exist.");
        require(cert.valido, "Certificate already revoked.");

        cert.valido = false;
        emit CertificateRevoked(_id);
    }

function getAllCertificateIds() public view returns (uint[] memory) {
    return certificateIds;
}
}

