// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UniversalPayments
 * @dev Universal payment contract for Push Chain with full on-chain functionality
 */
contract UniversalPayments is ReentrancyGuard, Ownable {
    
    constructor() Ownable(msg.sender) {
        // Contract deployer becomes the owner
    }
    
    struct Payment {
        bytes32 id;
        address sender;
        address recipient;
        uint256 amount;
        string token;
        uint256 timestamp;
        bool isRefunded;
        string senderPhone;
        string recipientPhone;
        string message;
    }
    
    struct GroupPayment {
        bytes32 id;
        address initiator;
        uint256 totalAmount;
        uint256 splitAmount;
        string token;
        address[] participants;
        string[] participantPhones;
        uint256 timestamp;
        bool isSettled;
        string description;
    }
    
    struct RefundRequest {
        bytes32 paymentId;
        address requester;
        uint256 timestamp;
        bool isProcessed;
        string reason;
    }
    
    // Storage mappings
    mapping(bytes32 => Payment) public payments;
    mapping(address => string) public phoneNumbers;
    mapping(string => address) public phoneToAddress;
    mapping(bytes32 => GroupPayment) public groupPayments;
    mapping(bytes32 => RefundRequest) public refundRequests;
    
    // User payment history
    mapping(address => bytes32[]) public userPayments;
    mapping(address => bytes32[]) public userGroupPayments;
    
    // Counters
    uint256 public totalPayments;
    uint256 public totalGroupPayments;
    uint256 public totalRefunds;
    
    // Events
    event PhoneNumberRegistered(
        address indexed user,
        string phoneNumber,
        uint256 timestamp
    );
    
    event PaymentSent(
        bytes32 indexed paymentId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string token,
        string senderPhone,
        string recipientPhone,
        string message,
        uint256 timestamp
    );
    
    event GroupPaymentCreated(
        bytes32 indexed groupId,
        address indexed initiator,
        uint256 totalAmount,
        uint256 splitAmount,
        string token,
        uint256 participantCount,
        string description,
        uint256 timestamp
    );
    
    event RefundRequested(
        bytes32 indexed refundId,
        bytes32 indexed paymentId,
        address indexed requester,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    event RefundProcessed(
        bytes32 indexed refundId,
        bytes32 indexed paymentId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @dev Register phone number with wallet address
     */
    function registerPhoneNumber(string memory _phoneNumber) external {
        require(bytes(_phoneNumber).length > 0, "Phone number cannot be empty");
        require(phoneToAddress[_phoneNumber] == address(0), "Phone number already registered");
        
        // If user already has a phone number, remove old mapping
        if (bytes(phoneNumbers[msg.sender]).length > 0) {
            delete phoneToAddress[phoneNumbers[msg.sender]];
        }
        
        phoneNumbers[msg.sender] = _phoneNumber;
        phoneToAddress[_phoneNumber] = msg.sender;
        
        emit PhoneNumberRegistered(msg.sender, _phoneNumber, block.timestamp);
    }
    
    /**
     * @dev Send payment to phone number (PC tokens only)
     */
    function sendPaymentToPhone(
        string memory _recipientPhone,
        string memory _message
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        require(bytes(_recipientPhone).length > 0, "Recipient phone required");
        
        address recipient = phoneToAddress[_recipientPhone];
        require(recipient != address(0), "Recipient not registered");
        require(recipient != msg.sender, "Cannot send to yourself");
        
        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, recipient, msg.value, block.timestamp, totalPayments)
        );
        
        payments[paymentId] = Payment({
            id: paymentId,
            sender: msg.sender,
            recipient: recipient,
            amount: msg.value,
            token: "PC",
            timestamp: block.timestamp,
            isRefunded: false,
            senderPhone: phoneNumbers[msg.sender],
            recipientPhone: _recipientPhone,
            message: _message
        });
        
        // Add to user payment history
        userPayments[msg.sender].push(paymentId);
        userPayments[recipient].push(paymentId);
        
        totalPayments++;
        
        // Transfer PC tokens
        payable(recipient).transfer(msg.value);
        
        emit PaymentSent(
            paymentId,
            msg.sender,
            recipient,
            msg.value,
            "PC",
            phoneNumbers[msg.sender],
            _recipientPhone,
            _message,
            block.timestamp
        );
    }
    
    /**
     * @dev Create group payment for splitting expenses
     */
    function createGroupPayment(
        string[] memory _participantPhones,
        string memory _description
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_participantPhones.length > 0, "Participants required");
        require(_participantPhones.length <= 20, "Maximum 20 participants");
        
        // Validate all participants are registered
        address[] memory participants = new address[](_participantPhones.length);
        for (uint i = 0; i < _participantPhones.length; i++) {
            address participant = phoneToAddress[_participantPhones[i]];
            require(participant != address(0), "Participant not registered");
            participants[i] = participant;
        }
        
        uint256 splitAmount = msg.value / _participantPhones.length;
        require(splitAmount > 0, "Split amount too small");
        
        bytes32 groupId = keccak256(
            abi.encodePacked(msg.sender, msg.value, block.timestamp, totalGroupPayments)
        );
        
        groupPayments[groupId] = GroupPayment({
            id: groupId,
            initiator: msg.sender,
            totalAmount: msg.value,
            splitAmount: splitAmount,
            token: "PC",
            participants: participants,
            participantPhones: _participantPhones,
            timestamp: block.timestamp,
            isSettled: false,
            description: _description
        });
        
        // Add to user group payment history
        userGroupPayments[msg.sender].push(groupId);
        for (uint i = 0; i < participants.length; i++) {
            userGroupPayments[participants[i]].push(groupId);
        }
        
        totalGroupPayments++;
        
        emit GroupPaymentCreated(
            groupId,
            msg.sender,
            msg.value,
            splitAmount,
            "PC",
            _participantPhones.length,
            _description,
            block.timestamp
        );
    }
    
    /**
     * @dev Settle group payment - distribute funds to participants
     */
    function settleGroupPayment(bytes32 _groupId) external nonReentrant {
        GroupPayment storage group = groupPayments[_groupId];
        require(group.initiator == msg.sender, "Only initiator can settle");
        require(!group.isSettled, "Already settled");
        require(address(this).balance >= group.totalAmount, "Insufficient contract balance");
        
        group.isSettled = true;
        
        // Distribute funds to participants
        for (uint i = 0; i < group.participants.length; i++) {
            payable(group.participants[i]).transfer(group.splitAmount);
        }
        
        // Refund any remainder to initiator
        uint256 remainder = group.totalAmount - (group.splitAmount * group.participants.length);
        if (remainder > 0) {
            payable(msg.sender).transfer(remainder);
        }
    }
    
    /**
     * @dev Request refund for a payment
     */
    function requestRefund(bytes32 _paymentId, string memory _reason) external {
        Payment storage payment = payments[_paymentId];
        require(payment.sender == msg.sender, "Only sender can request refund");
        require(!payment.isRefunded, "Payment already refunded");
        require(block.timestamp <= payment.timestamp + 24 hours, "Refund period expired");
        
        bytes32 refundId = keccak256(
            abi.encodePacked(_paymentId, msg.sender, block.timestamp, totalRefunds)
        );
        
        refundRequests[refundId] = RefundRequest({
            paymentId: _paymentId,
            requester: msg.sender,
            timestamp: block.timestamp,
            isProcessed: false,
            reason: _reason
        });
        
        totalRefunds++;
        
        emit RefundRequested(
            refundId,
            _paymentId,
            msg.sender,
            payment.amount,
            _reason,
            block.timestamp
        );
        
        // Auto-process refund (in production, might require approval)
        _processRefund(refundId);
    }
    
    /**
     * @dev Process refund (internal)
     */
    function _processRefund(bytes32 _refundId) internal {
        RefundRequest storage refund = refundRequests[_refundId];
        require(!refund.isProcessed, "Refund already processed");
        
        Payment storage payment = payments[refund.paymentId];
        require(!payment.isRefunded, "Payment already refunded");
        
        // Mark as refunded
        payment.isRefunded = true;
        refund.isProcessed = true;
        
        // Transfer refund amount back to sender
        payable(payment.sender).transfer(payment.amount);
        
        emit RefundProcessed(
            _refundId,
            refund.paymentId,
            payment.sender,
            payment.amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Get user's payment history
     */
    function getUserPayments(address _user) external view returns (bytes32[] memory) {
        return userPayments[_user];
    }
    
    /**
     * @dev Get user's group payment history
     */
    function getUserGroupPayments(address _user) external view returns (bytes32[] memory) {
        return userGroupPayments[_user];
    }
    
    /**
     * @dev Get payment details
     */
    function getPayment(bytes32 _paymentId) external view returns (Payment memory) {
        return payments[_paymentId];
    }
    
    /**
     * @dev Get group payment details
     */
    function getGroupPayment(bytes32 _groupId) external view returns (GroupPayment memory) {
        return groupPayments[_groupId];
    }
    
    /**
     * @dev Get phone number for address
     */
    function getPhoneNumber(address _user) external view returns (string memory) {
        return phoneNumbers[_user];
    }
    
    /**
     * @dev Get address for phone number
     */
    function getAddressFromPhone(string memory _phoneNumber) external view returns (address) {
        return phoneToAddress[_phoneNumber];
    }
    
    /**
     * @dev Check if phone number is registered
     */
    function isPhoneRegistered(string memory _phoneNumber) external view returns (bool) {
        return phoneToAddress[_phoneNumber] != address(0);
    }
    
    /**
     * @dev Get contract stats
     */
    function getStats() external view returns (uint256, uint256, uint256) {
        return (totalPayments, totalGroupPayments, totalRefunds);
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept PC tokens
     */
    receive() external payable {}
}