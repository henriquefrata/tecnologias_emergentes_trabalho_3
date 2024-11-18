const RegCertificado = artifacts.require('../contracts/RegCertificado.sol');

module.exports = async function (_deployer) {
  await _deployer.deploy(RegCertificado);
  await RegCertificado.deployed();
};
