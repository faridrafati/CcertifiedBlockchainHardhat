// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WeightedVoting {
    struct Voters {
        uint weight;
        bool hasVoted;
    }

    struct Candidates {
        string name;
        uint voteCount;
    }

    mapping(address => Voters) voters;

    Candidates[] public candidatesList;

    address public owner;

    constructor(string[] memory _Candidates) {
        candidatesList.push(Candidates({name: _Candidates[0], voteCount: 0}));
        candidatesList.push(Candidates({name: _Candidates[1], voteCount: 0}));
        candidatesList.push(Candidates({name: _Candidates[2], voteCount: 0}));
        owner = msg.sender;
        voters[msg.sender].weight = 1;
        voters[msg.sender].hasVoted = false;
    }

    function authorizeVoter(address _address, uint _weight) public {
        assert(msg.sender == owner);
        assert(!voters[_address].hasVoted);
        voters[_address] = Voters({weight: _weight, hasVoted: false});
    }

    function voteForCandidate(uint _index) public {
        require(voters[msg.sender].weight != 0);
        require(voters[msg.sender].hasVoted == false);
        candidatesList[_index].voteCount =
            candidatesList[_index].voteCount +
            voters[msg.sender].weight;
        voters[msg.sender].hasVoted = true;
    }

    function getVoteForCandidate(uint _index) public view returns (uint) {
        return candidatesList[_index].voteCount;
    }

    function isAuthorizedVoter() public view returns (uint, bool) {
        return (voters[msg.sender].weight, voters[msg.sender].hasVoted);
    }

    function getAllCandidatesWithVotes()
        public
        view
        returns (string memory, uint, string memory, uint, string memory, uint)
    {
        return (
            candidatesList[0].name,
            candidatesList[0].voteCount,
            candidatesList[1].name,
            candidatesList[1].voteCount,
            candidatesList[2].name,
            candidatesList[2].voteCount
        );
    }
}
