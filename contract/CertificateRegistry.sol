//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0; 

contract Verification{

    struct Certificate{
        string certificateId;
        address student;
        address issuer;
        string cid;
        bytes32 hash;
        uint256 timestamp;
    }

    address public owner;
    mapping(address => bool) public approvedIssuer;
    mapping(string => Certificate) issuedCertificates;//certificateId -> Certi

    constructor(){
        owner = msg.sender;
    }

    modifier onlyOwner(){
        require(msg.sender == owner,"Not Owner");
        _;
    }

    function approveIssuer(address issuer) public onlyOwner(){
        approvedIssuer[issuer] = true;
    }

    function unapproveIssuer(address issuer) public onlyOwner(){
        delete approvedIssuer[issuer];
    }

    function issueCertificate(string calldata certificateId,address student,bytes32 hash,string cid) public{
        require (issuedCertificates[certificateId].timestamp == 0,"Certificate already issued");
        require(approvedIssuer[msg.sender] ,"Not approved Issuer");
        issuedCertificates[certificateId] = Certificate({
            certificateId : certificateId,
            student : student,
            issuer : msg.sender,
            cid : cid,
            hash : hash,
            timestamp : block.timestamp
        });
    }

    function getCertificate(string certificateId) public view returns (Certificate memory){
        if(issuedCertificates[certificateId].timestamp != 0)
            return issuedCertificates[certificateId];
        else 
            revert("Certficate not found");
    }

}