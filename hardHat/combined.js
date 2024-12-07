export const PET_CONTRACT_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
export const PET_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_petId",
				"type": "uint256"
			}
		],
		"name": "adopt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "adoptors",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAdoptors",
		"outputs": [
			{
				"internalType": "address[16]",
				"name": "",
				"type": "address[16]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]