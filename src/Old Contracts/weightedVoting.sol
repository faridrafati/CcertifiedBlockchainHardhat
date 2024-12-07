// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract WeightedVoting {

    struct Voters {
        uint weight;
        bool hasVoted;
    }
    
    struct Candidates{
        string name;
        uint voteCount;
    }

    mapping(address => Voters) voters;

    Candidates[] public candidatesList;

    address public owner;

    constructor(string memory _candidate1, string memory _candidate2, string memory _candidate3) {
        candidatesList.push(Candidates({name : _candidate1,voteCount : 0}));
        candidatesList.push(Candidates({name : _candidate2,voteCount : 0}));
        candidatesList.push(Candidates({name : _candidate3,voteCount : 0}));
        owner = msg.sender;
    }



    function authorizeVoter(address _address) public {
        assert(msg.sender == owner);
        assert(!voters[_address].hasVoted);
        voters[_address] = Voters({weight : 1, hasVoted : false});
    }


    function voteForCandidate(uint _index) public {
        candidatesList[_index].voteCount = candidatesList[_index].voteCount + voters[msg.sender].weight;
        if(voters[msg.sender].weight > 0){
            voters[msg.sender].weight = 0;
            voters[msg.sender].hasVoted = true;
        }
    }


    function getVoteForCandidate(uint _index) public view returns(uint){
        return candidatesList[_index].voteCount;
    }


    function getAllCandidatesWithVotes() public view returns (string memory, uint, string memory, uint, string memory, uint){
      return(candidatesList[0].name, candidatesList[0].voteCount,
        candidatesList[1].name, candidatesList[1].voteCount,
        candidatesList[2].name, candidatesList[2].voteCount);
    }
}



