// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ChainSyncMarketplace
 * @dev Universal marketplace contract for ChainSync with full on-chain functionality
 */
contract ChainSyncMarketplace is ReentrancyGuard, Ownable, Pausable {
    
    constructor() Ownable(msg.sender) {}
    
    // Structs
    struct Product {
        uint256 id;
        address seller;
        string title;
        string description;
        uint256 price;
        string category;
        string imageHash; // IPFS hash
        bool isActive;
        uint256 createdAt;
        uint256 totalSales;
        uint256 totalRating;
        uint256 ratingCount;
    }
    
    struct Purchase {
        uint256 id;
        uint256 productId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 timestamp;
        bool isDelivered;
        bool isRefunded;
        uint8 rating;
        string review;
    }
    
    struct User {
        address wallet;
        string telegramId;
        string username;
        string profileHash; // IPFS hash
        uint256 totalPurchases;
        uint256 totalSales;
        uint256 reputation;
        bool isVerified;
        uint256 joinedAt;
    }
    
    struct SocialPost {
        uint256 id;
        address author;
        uint256 productId;
        string content;
        uint256 likes;
        uint256 shares;
        uint256 timestamp;
        bool isActive;
    }
    
    // Storage
    mapping(uint256 => Product) public products;
    mapping(uint256 => Purchase) public purchases;
    mapping(address => User) public users;
    mapping(string => address) public telegramToWallet;
    mapping(uint256 => SocialPost) public socialPosts;
    
    // User interactions
    mapping(address => uint256[]) public userProducts;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256[]) public userPosts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => mapping(address => bool)) public following;
    mapping(address => address[]) public followers;
    mapping(address => address[]) public followingList;
    
    // Counters
    uint256 public nextProductId = 1;
    uint256 public nextPurchaseId = 1;
    uint256 public nextPostId = 1;
    
    // Platform settings
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeRecipient;
    
    // Events
    event UserRegistered(
        address indexed wallet,
        string telegramId,
        string username,
        uint256 timestamp
    );
    
    event ProductListed(
        uint256 indexed productId,
        address indexed seller,
        string title,
        uint256 price,
        string category,
        uint256 timestamp
    );
    
    event ProductPurchased(
        uint256 indexed purchaseId,
        uint256 indexed productId,
        address indexed buyer,
        address seller,
        uint256 amount,
        uint256 timestamp
    );
    
    event SocialPostCreated(
        uint256 indexed postId,
        address indexed author,
        uint256 productId,
        string content,
        uint256 timestamp
    );
    
    event PostLiked(
        uint256 indexed postId,
        address indexed liker,
        uint256 totalLikes,
        uint256 timestamp
    );
    
    event UserFollowed(
        address indexed follower,
        address indexed following,
        uint256 timestamp
    );
    
    event ProductRated(
        uint256 indexed productId,
        address indexed buyer,
        uint8 rating,
        string review,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyRegistered() {
        require(users[msg.sender].wallet != address(0), "User not registered");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId < nextProductId, "Product does not exist");
        _;
    }
    
    modifier onlyProductSeller(uint256 _productId) {
        require(products[_productId].seller == msg.sender, "Not the product seller");
        _;
    }
    
    /**
     * @dev Register user with Telegram ID
     */
    function registerUser(
        string memory _telegramId,
        string memory _username,
        string memory _profileHash
    ) external {
        require(bytes(_telegramId).length > 0, "Telegram ID required");
        require(users[msg.sender].wallet == address(0), "User already registered");
        require(telegramToWallet[_telegramId] == address(0), "Telegram ID already used");
        
        users[msg.sender] = User({
            wallet: msg.sender,
            telegramId: _telegramId,
            username: _username,
            profileHash: _profileHash,
            totalPurchases: 0,
            totalSales: 0,
            reputation: 100, // Starting reputation
            isVerified: false,
            joinedAt: block.timestamp
        });
        
        telegramToWallet[_telegramId] = msg.sender;
        
        emit UserRegistered(msg.sender, _telegramId, _username, block.timestamp);
    }
    
    /**
     * @dev List a new product
     */
    function listProduct(
        string memory _title,
        string memory _description,
        uint256 _price,
        string memory _category,
        string memory _imageHash
    ) external onlyRegistered whenNotPaused {
        require(bytes(_title).length > 0, "Title required");
        require(_price > 0, "Price must be greater than 0");
        
        uint256 productId = nextProductId++;
        
        products[productId] = Product({
            id: productId,
            seller: msg.sender,
            title: _title,
            description: _description,
            price: _price,
            category: _category,
            imageHash: _imageHash,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0,
            totalRating: 0,
            ratingCount: 0
        });
        
        userProducts[msg.sender].push(productId);
        
        emit ProductListed(productId, msg.sender, _title, _price, _category, block.timestamp);
    }
    
    /**
     * @dev Purchase a product
     */
    function purchaseProduct(uint256 _productId) 
        external 
        payable 
        onlyRegistered 
        productExists(_productId) 
        nonReentrant 
        whenNotPaused 
    {
        Product storage product = products[_productId];
        require(product.isActive, "Product not active");
        require(product.seller != msg.sender, "Cannot buy your own product");
        require(msg.value == product.price, "Incorrect payment amount");
        
        uint256 purchaseId = nextPurchaseId++;
        
        purchases[purchaseId] = Purchase({
            id: purchaseId,
            productId: _productId,
            buyer: msg.sender,
            seller: product.seller,
            amount: msg.value,
            timestamp: block.timestamp,
            isDelivered: false,
            isRefunded: false,
            rating: 0,
            review: ""
        });
        
        userPurchases[msg.sender].push(purchaseId);
        product.totalSales++;
        users[msg.sender].totalPurchases++;
        users[product.seller].totalSales++;
        
        // Calculate fees
        uint256 fee = (msg.value * platformFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = msg.value - fee;
        
        // Transfer payments
        if (fee > 0 && feeRecipient != address(0)) {
            payable(feeRecipient).transfer(fee);
        }
        payable(product.seller).transfer(sellerAmount);
        
        emit ProductPurchased(
            purchaseId,
            _productId,
            msg.sender,
            product.seller,
            msg.value,
            block.timestamp
        );
    }
    
    /**
     * @dev Create social post about a product
     */
    function createSocialPost(
        uint256 _productId,
        string memory _content
    ) external onlyRegistered productExists(_productId) {
        require(bytes(_content).length > 0, "Content required");
        
        uint256 postId = nextPostId++;
        
        socialPosts[postId] = SocialPost({
            id: postId,
            author: msg.sender,
            productId: _productId,
            content: _content,
            likes: 0,
            shares: 0,
            timestamp: block.timestamp,
            isActive: true
        });
        
        userPosts[msg.sender].push(postId);
        
        emit SocialPostCreated(postId, msg.sender, _productId, _content, block.timestamp);
    }
    
    /**
     * @dev Like a social post
     */
    function likePost(uint256 _postId) external onlyRegistered {
        require(_postId > 0 && _postId < nextPostId, "Post does not exist");
        require(!postLikes[_postId][msg.sender], "Already liked");
        
        postLikes[_postId][msg.sender] = true;
        socialPosts[_postId].likes++;
        
        emit PostLiked(_postId, msg.sender, socialPosts[_postId].likes, block.timestamp);
    }
    
    /**
     * @dev Follow another user
     */
    function followUser(address _user) external onlyRegistered {
        require(_user != msg.sender, "Cannot follow yourself");
        require(users[_user].wallet != address(0), "User not registered");
        require(!following[msg.sender][_user], "Already following");
        
        following[msg.sender][_user] = true;
        followers[_user].push(msg.sender);
        followingList[msg.sender].push(_user);
        
        emit UserFollowed(msg.sender, _user, block.timestamp);
    }
    
    /**
     * @dev Rate a purchased product
     */
    function rateProduct(
        uint256 _purchaseId,
        uint8 _rating,
        string memory _review
    ) external onlyRegistered {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        
        Purchase storage purchase = purchases[_purchaseId];
        require(purchase.buyer == msg.sender, "Not your purchase");
        require(purchase.rating == 0, "Already rated");
        
        purchase.rating = _rating;
        purchase.review = _review;
        
        Product storage product = products[purchase.productId];
        product.totalRating += _rating;
        product.ratingCount++;
        
        // Update seller reputation
        users[purchase.seller].reputation += _rating;
        
        emit ProductRated(purchase.productId, msg.sender, _rating, _review, block.timestamp);
    }
    
    /**
     * @dev Get user's wallet from Telegram ID
     */
    function getWalletFromTelegram(string memory _telegramId) external view returns (address) {
        return telegramToWallet[_telegramId];
    }
    
    /**
     * @dev Get user products
     */
    function getUserProducts(address _user) external view returns (uint256[] memory) {
        return userProducts[_user];
    }
    
    /**
     * @dev Get user purchases
     */
    function getUserPurchases(address _user) external view returns (uint256[] memory) {
        return userPurchases[_user];
    }
    
    /**
     * @dev Get user social posts
     */
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }
    
    /**
     * @dev Get product rating
     */
    function getProductRating(uint256 _productId) external view returns (uint256, uint256) {
        Product memory product = products[_productId];
        if (product.ratingCount == 0) return (0, 0);
        return (product.totalRating / product.ratingCount, product.ratingCount);
    }
    
    /**
     * @dev Get user followers
     */
    function getUserFollowers(address _user) external view returns (address[] memory) {
        return followers[_user];
    }
    
    /**
     * @dev Get user following
     */
    function getUserFollowing(address _user) external view returns (address[] memory) {
        return followingList[_user];
    }
    
    /**
     * @dev Check if user is following another user
     */
    function isFollowing(address _follower, address _following) external view returns (bool) {
        return following[_follower][_following];
    }
    
    /**
     * @dev Admin functions
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }
    
    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }
    
    function verifyUser(address _user) external onlyOwner {
        users[_user].isVerified = true;
    }
    
    function pauseContract() external onlyOwner {
        _pause();
    }
    
    function unpauseContract() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency functions
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    receive() external payable {}
}