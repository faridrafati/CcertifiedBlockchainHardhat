// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    //uint public PriceToAdd;
    //uint public PriceToVote;

    address[] Voters;
    mapping(address => uint) public votes;

    address[] public Candidates;
    uint public numberOfCandidates;

    constructor(address[] memory FirstCandidates) {
        for (uint i = 0; i < FirstCandidates.length; i++) {
            Candidates.push(FirstCandidates[i]);
            numberOfCandidates++;
        }
        //PriceToAdd = priceToAdd;
        //PriceToVote = priceToVote;
    }

    function addCandidate(address Candidate) public payable {
        require(!CandidateExists(Candidate));
        // require(msg.value == PriceToAdd);
        Candidates.push(Candidate);
        numberOfCandidates++;
    }

    function voteForCandidate(address Candidate) public payable {
        // require(msg.value == PriceToVote);
        require(CandidateExists(Candidate));
        require(!HasVoted(msg.sender));
        votes[Candidate] += 1;
        Voters.push(msg.sender);
    }

    function CandidateExists(address Candidate) public view returns (bool) {
        for (uint i = 0; i < numberOfCandidates; i++) {
            if (Candidates[i] == Candidate) {
                return true;
            }
        }
        return false;
    }

    function HasVoted(address Voter) public view returns (bool) {
        for (uint i = 0; i < Voters.length; i++) {
            if (Voters[i] == Voter) {
                return true;
            }
        }
        return false;
    }

    function VotesForCandidate(address Candidate) public view returns (uint) {
        return votes[Candidate];
    }
}
