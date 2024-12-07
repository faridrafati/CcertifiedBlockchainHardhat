export const CHATBOXPLUS_ADDRESS = "0x1Dbbf529D78d6507B0dd71F6c02f41138d828990";
export const CHATBOXPLUS_ABI = [{"inputs":[{"internalType":"bytes32[]","name":"_username","type":"bytes32[]"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"address","name":"looser","type":"address"}],"name":"GameWinner","type":"event"},{"inputs":[],"name":"boardSize","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"checkUserRegistration","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"clearInbox","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"clearMyContactList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"contactList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_invitedPlayer","type":"address"}],"name":"createGame","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"},{"internalType":"bool","name":"_add","type":"bool"}],"name":"editMyContactList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"game","outputs":[{"internalType":"address","name":"player1","type":"address"},{"internalType":"address","name":"player2","type":"address"},{"internalType":"bool","name":"gameActive","type":"bool"},{"internalType":"address","name":"activePlayer","type":"address"},{"internalType":"uint8","name":"movesCounter","type":"uint8"},{"internalType":"address","name":"winner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gameCounter","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_secondPlayer","type":"address"}],"name":"gameIndexFunction","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_secondPlayer","type":"address"}],"name":"getBoard","outputs":[{"internalType":"address[3][3]","name":"","type":"address[3][3]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractProperties","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMyContactList","outputs":[{"internalType":"address[64]","name":"","type":"address[64]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMyInboxSize","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"receiveMessages","outputs":[{"internalType":"bytes32[64]","name":"","type":"bytes32[64]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_username","type":"bytes32"}],"name":"registerUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_secondPlayer","type":"address"}],"name":"resetGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_receiver","type":"address"},{"internalType":"bytes32","name":"_content","type":"bytes32"}],"name":"sendMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sentMessages","outputs":[{"internalType":"bytes32[64]","name":"","type":"bytes32[64]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"x","type":"uint8"},{"internalType":"uint8","name":"y","type":"uint8"},{"internalType":"address","name":"_secondPlayer","type":"address"}],"name":"setStone","outputs":[],"stateMutability":"nonpayable","type":"function"}]