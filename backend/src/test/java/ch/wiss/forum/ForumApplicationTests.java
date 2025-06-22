package ch.wiss.forum;

/**
 * Comprehensive test suite for the wiss forum application.
 * 
 * @author Yanis Sebastian Zürcher (lyfe691)
 */

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import ch.wiss.forum.model.Category;
import ch.wiss.forum.model.Post;
import ch.wiss.forum.model.Role;
import ch.wiss.forum.model.Topic;
import ch.wiss.forum.model.User;
import ch.wiss.forum.payload.request.RegisterRequest;
import ch.wiss.forum.repository.CategoryRepository;
import ch.wiss.forum.repository.PostRepository;
import ch.wiss.forum.repository.TopicRepository;
import ch.wiss.forum.repository.UserRepository;
import ch.wiss.forum.security.JwtUtils;
import ch.wiss.forum.service.AuthService;
import ch.wiss.forum.service.EmailService;
import ch.wiss.forum.service.GamificationService;
import ch.wiss.forum.service.PostService;
import ch.wiss.forum.service.TopicService;
import ch.wiss.forum.validation.UserValidator;

@ExtendWith(MockitoExtension.class)
class ForumApplicationTests {

	@Mock
	private UserRepository userRepository;
	
	@Mock
	private TopicRepository topicRepository;
	
	@Mock
	private PostRepository postRepository;
	
	@Mock
	private CategoryRepository categoryRepository;
	
	@Mock
	private PasswordEncoder passwordEncoder;
	
	    @Mock
    private JwtUtils jwtUtils;
    
    @Mock
    private UserValidator userValidator;
    
    @Mock
    private GamificationService gamificationService;
    
    @Mock 
    private TopicService topicService;
    
    @Mock
    private PostService postService;
    
    @Mock
    private EmailService emailService;
    
    @InjectMocks
    private UserValidator realUserValidator;
    
    @InjectMocks
    private GamificationService realGamificationService;
    
    @InjectMocks
    private TopicService realTopicService;
    
    @InjectMocks
    private PostService realPostService;
    
    @InjectMocks
    private AuthService authService;

	private User testUser;
	private Topic testTopic;
	private Post testPost;
	private Category testCategory;

	@BeforeEach
	void setUp() {
		testUser = User.builder()
				.id("user123")
				.username("testuser")
				.email("test@wiss-edu.ch")
				.displayName("Test User")
				.role(Role.STUDENT)
				.totalScore(100)
				.level(2)
				.topicsCreated(2)
				.postsCreated(5)
				.likesReceived(3)
				.currentStreak(1)
				.longestStreak(5)
				.achievements(new ArrayList<>())
				.badges(new ArrayList<>())
				.createdAt(LocalDateTime.now())
				.build();

		testCategory = Category.builder()
				.id("cat123")
				.name("General Discussion")
				.slug("general-discussion")
				.description("General topics")
				.build();

		testTopic = Topic.builder()
				.id("topic123")
				.title("Test Topic")
				.content("Test content")
				.slug("test-topic")
				.category(testCategory)
				.author(testUser)
				.viewCount(10)
				.replyCount(2)
				.createdAt(LocalDateTime.now())
				.build();

		testPost = Post.builder()
				.id("post123")
				.content("Test post content")
				.topic(testTopic)
				.author(testUser)
				.likes(new ArrayList<>())
				.createdAt(LocalDateTime.now())
				.build();
	}

	@Test
	@DisplayName("Should reject username containing inappropriate terms")
	void testUsernameValidation_WithInappropriateTerms_ShouldReturnFalse() {
		// arrange
		String inappropriateUsername = "adminuser";
		
		// act
		boolean result = realUserValidator.isValidUsername(inappropriateUsername);
		
		// assert
		assertFalse(result, "username containing 'admin' should be rejected");
	}

	@Test
	@DisplayName("Should validate email with correct WISS domain")
	void testEmailValidation_WithValidWissEmail_ShouldReturnTrue() {
		// arrange
		String validEmail = "student.name@wiss-edu.ch";
		String alternativeValidEmail = "teacher@wiss.ch";
		
		// act & assert
		assertTrue(realUserValidator.isValidEmail(validEmail), 
			"email with @wiss-edu.ch domain should be valid");
		assertTrue(realUserValidator.isValidEmail(alternativeValidEmail), 
			"email with @wiss.ch domain should be valid");
		
		// test invalid domain
		assertFalse(realUserValidator.isValidEmail("user@gmail.com"), 
			"email with non-wiss domain should be invalid");
	}

	@Test
	@DisplayName("Should update user stats and level when topic is created")
	void testGamificationService_OnTopicCreated_ShouldUpdateStatsAndLevel() {
		// arrange
		User user = User.builder()
				.id("user123")
				.username("testuser")
				.totalScore(37) // starting score (10 topic points + 3 streak bonus = 50 for level 2)
				.level(1)
				.topicsCreated(0)
				.lastActivityDate(null) // no previous activity for streak calculation
				.build();
		
		when(userRepository.findById("user123")).thenReturn(Optional.of(user));
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
		
		// act
		realGamificationService.updateUserStatsOnTopicCreated(user);
		
		// assert - 4b) enhanced verification with proper interaction checking
		verify(userRepository).save(argThat(savedUser -> {
			assertEquals(1, savedUser.getTopicsCreated(), "topics created should be incremented");
			assertEquals(50, savedUser.getTotalScore(), "score should increase by 13 points (10 + 3 streak bonus)");
			assertEquals(2, savedUser.getLevel(), "user should level up to level 2");
			return true;
		}));
		
		// 4b) verify the method was called exactly once with correct user
		verify(userRepository, times(1)).save(any(User.class));
		verifyNoMoreInteractions(userRepository);
	}

	@Test
	@DisplayName("Should award achievements when user reaches milestones")
	void testGamificationService_PostCreated_ShouldAwardFirstPostAchievement() {
		// arrange - user with no posts yet
		User newUser = User.builder()
				.id("newuser123")
				.username("newuser")
				.totalScore(0)
				.level(1)
				.topicsCreated(0)
				.postsCreated(0) // no posts yet
				.achievements(new ArrayList<>()) // no achievements yet
				.lastActivityDate(null) // no previous activity for streak calculation
				.build();
		
		when(userRepository.findById("newuser123")).thenReturn(Optional.of(newUser));
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
		
		// act
		realGamificationService.updateUserStatsOnPostCreated(newUser);
		
		// assert - 4b) enhanced verification with interaction checking
		verify(userRepository).save(argThat(savedUser -> {
			assertEquals(1, savedUser.getPostsCreated(), "posts created should be incremented");
			assertEquals(8, savedUser.getTotalScore(), "score should increase by 8 points (5 + 3 streak bonus)");
			assertTrue(savedUser.getAchievements().contains("FIRST_POST"), 
				"should award first_post achievement");
			return true;
		}));
		
		// 4b) verify exactly one save operation occurred
		verify(userRepository, times(1)).save(any(User.class));
		verifyNoMoreInteractions(userRepository);
	}

	@Test
	@DisplayName("Should generate unique slug when creating topic with duplicate title")
	void testTopicService_CreateTopic_ShouldGenerateUniqueSlugForDuplicateTitle() {
		// arrange
		Topic newTopic = Topic.builder()
				.title("My Test Topic")
				.content("Content")
				.category(testCategory)
				.build();
		
		// mock that slug already exists
		when(topicRepository.existsBySlug(anyString())).thenReturn(true);
		when(topicRepository.save(any(Topic.class))).thenAnswer(invocation -> invocation.getArgument(0));
		
		// act
		Topic createdTopic = realTopicService.createTopic(newTopic, testUser);
		
		// assert
		assertNotNull(createdTopic.getSlug(), "slug should be generated");
		assertTrue(createdTopic.getSlug().startsWith("my-test-topic-"), 
			"slug should start with formatted title");
		assertTrue(createdTopic.getSlug().contains("-"), 
			"slug should contain timestamp for uniqueness");
		assertEquals(testUser, createdTopic.getAuthor(), "author should be set correctly");
		assertEquals(0, createdTopic.getViewCount(), "view count should be initialized to 0");
	}

	@Test
	@DisplayName("Should add like and update gamification stats when user likes post")
	void testPostService_LikePost_ShouldAddLikeAndUpdateGamification() {
		// arrange
		User likingUser = User.builder()
				.id("liker123")
				.username("liker")
				.build();
		
		Post post = Post.builder()
				.id("post123")
				.content("Great post!")
				.author(testUser)
				.likes(new ArrayList<>())
				.build();
		
		when(postRepository.findById("post123")).thenReturn(Optional.of(post));
		when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));
		
		// act
		Post likedPost = realPostService.likePost("post123", likingUser);
		
		// assert
		assertTrue(likedPost.getLikes().contains("liker123"), 
			"post should contain the liker's user id");
		assertEquals(1, likedPost.getLikes().size(), 
			"post should have exactly one like");
		
		// verify that the post was saved with the like
		verify(postRepository).save(argThat(savedPost -> 
			savedPost.getLikes().contains("liker123") && savedPost.getLikes().size() == 1
		));
	}

	@Test
	@DisplayName("Should successfully register user with valid data and encode password")
	void testAuthService_RegisterUser_ShouldCreateUserWithEncodedPassword() {
		// arrange
		RegisterRequest request = new RegisterRequest();
		request.setUsername("newuser");
		request.setEmail("newuser@wiss-edu.ch");
		request.setPassword("password123");
		request.setDisplayName("New User");
		request.setRole(Role.STUDENT);
		
		// mock validator responses
		when(userValidator.isValidUsername("newuser")).thenReturn(true);
		when(userValidator.isValidEmail("newuser@wiss-edu.ch")).thenReturn(true);
		when(userValidator.isValidPassword("password123")).thenReturn(true);
		when(userValidator.isValidDisplayName("New User")).thenReturn(true);
		
		when(userRepository.existsByUsername("newuser")).thenReturn(false);
		when(userRepository.existsByEmail("newuser@wiss-edu.ch")).thenReturn(false);
		when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			user.setId("newuser123"); // simulate database id assignment
			return user;
		});
		when(jwtUtils.generateJwtToken("newuser")).thenReturn("jwt_token");
		
		// act
		var response = authService.registerUser(request);
		
		// assert
		assertNotNull(response, "response should not be null");
		assertEquals("jwt_token", response.getToken(), "jwt token should be returned");
		assertEquals("newuser", response.getUsername(), "username should match");
		assertEquals("newuser@wiss-edu.ch", response.getEmail(), "email should match");
		assertEquals(Role.STUDENT, response.getRole(), "role should be student");
		
		// verify password was encoded
		verify(passwordEncoder).encode("password123");
		
		// verify user was saved with encoded password (called twice - once for registration, once for avatar)
		verify(userRepository, times(2)).save(argThat(user -> 
			"encoded_password".equals(user.getPassword()) &&
			"newuser".equals(user.getUsername()) &&
			"newuser@wiss-edu.ch".equals(user.getEmail())
		));
	}

	@Test
	@DisplayName("Should generate valid JWT token with correct claims for user")
	void testJwtUtils_GenerateToken_ShouldCreateValidTokenWithUserClaims() {
		// arrange
		User user = User.builder()
				.id("user123")
				.username("testuser")
				.email("test@wiss-edu.ch") // or wiss.ch--doesn't matter
				.role(Role.STUDENT)
				.build();
		
		// create a real jwtutils instance for this test
		JwtUtils realJwtUtils = new JwtUtils();
		// use reflection to set the secret for testing
		try {
			var secretField = JwtUtils.class.getDeclaredField("jwtSecret");
			secretField.setAccessible(true);
			// strong 512-bit key for hs512 algorithm
			secretField.set(realJwtUtils, "dGhpc0lzQVN0cm9uZ0p3dFNlY3JldEtleUZvckp3dFRva2VuR2VuZXJhdGlvbkFuZFZhbGlkYXRpb25UaGF0SXNBdExlYXN0NTEyQml0c0xvbmdGb3JIUzUxMg=="); // strong base64 encoded test secret
			
			var expirationField = JwtUtils.class.getDeclaredField("jwtExpirationMs");
			expirationField.setAccessible(true);
			expirationField.set(realJwtUtils, 86400000); // 24 hours
			
			// initialize the key
			realJwtUtils.init();
		} catch (Exception e) {
			fail("failed to setup jwtutils for testing: " + e.getMessage());
		}
		
		// act
		String token = realJwtUtils.generateJwtToken(user);
		
		// assert
		assertNotNull(token, "token should not be null");
		assertFalse(token.isEmpty(), "token should not be empty");
		
		// verify token is valid
		assertTrue(realJwtUtils.validateJwtToken(token), "generated token should be valid");
		
		// verify token contains correct username
		String extractedUsername = realJwtUtils.getUsernameFromJwtToken(token);
		assertEquals("testuser", extractedUsername, "token should contain correct username");
		
		// verify token contains correct user id
		String extractedUserId = realJwtUtils.getUserIdFromJwtToken(token);
		assertEquals("user123", extractedUserId, "token should contain correct user id");
	}

	// 4b) new advanced mockito tests using both @Mock and @Spy annotations

	@Test
	@DisplayName("Should verify complex service interaction with spy and mock combination")
	void testComplexServiceInteraction_WithSpyAndMock_ShouldVerifyAllCalls() {
		// arrange - 4b) using spy for real gamification service behavior with mocked dependencies
		User user = User.builder()
				.id("testuser123")
				.username("testuser")
				.totalScore(45)
				.level(1)
				.topicsCreated(1)
				.postsCreated(3)
				.achievements(new ArrayList<>())
				.lastActivityDate(LocalDateTime.now().minusDays(2)) // 2 days ago for streak testing
				.build();
		
		// 4b) create a spy on the user repository to track interactions while keeping mock behavior
		UserRepository spyUserRepository = spy(UserRepository.class);
		when(spyUserRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
		
		// create gamification service with spied repository
		GamificationService gamificationServiceWithSpy = new GamificationService(spyUserRepository);
		
		// act - call real method on service which will use spied repository
		gamificationServiceWithSpy.updateUserStatsOnTopicCreated(user);
		
		// assert - 4b) verify spy repository interactions occurred correctly
		verify(spyUserRepository, times(1)).save(argThat(savedUser -> {
			// verify gamification logic worked correctly
			assertEquals(2, savedUser.getTopicsCreated(), "topics should be incremented");
			assertEquals(58, savedUser.getTotalScore(), "score should increase by 13 points (10 + 3 streak bonus)");
			assertEquals(2, savedUser.getLevel(), "user should level up to level 2");
			return true;
		}));
		
		// 4b) verify that only expected interactions occurred (gamification service may call findById and save)
		verify(spyUserRepository, atLeastOnce()).save(any(User.class));
		
		// additional verification - ensure the service processed the user correctly
		assertEquals(2, user.getTopicsCreated(), "original user object should be modified");
		assertEquals(58, user.getTotalScore(), "original user total score should be updated");
	}

	@Test
	@DisplayName("Should handle service dependency chain with spy and mock verification")
	void testServiceDependencyChain_WithSpyAndMock_ShouldTrackInteractions() {
		// arrange - 4b) testing topic service that depends on both gamification and repository
		Topic newTopic = Topic.builder()
				.title("Advanced Java Programming")
				.content("Let's discuss advanced Java concepts")
				.category(testCategory)
				.build();
		
		User author = User.builder()
				.id("author123")
				.username("javaexpert")
				.totalScore(200)
				.level(5)
				.topicsCreated(10)
				.achievements(new ArrayList<>(Arrays.asList("FIRST_TOPIC", "TOPIC_MASTER"))) // 4b) mutable list for achievements
				.build();
		
		// mock repository behavior
		when(topicRepository.existsBySlug(anyString())).thenReturn(false); // no slug conflicts
		when(topicRepository.save(any(Topic.class))).thenAnswer(invocation -> {
			Topic topic = invocation.getArgument(0);
			topic.setId("newtopic123"); // simulate database id assignment
			return topic;
		});
		
		// 4b) spy on gamification service to track method calls while keeping real behavior
		GamificationService spyGamificationService = spy(new GamificationService(userRepository));
		
		// create topic service with spy gamification service
		TopicService topicServiceWithSpy = new TopicService(topicRepository, categoryRepository, spyGamificationService);
		
		// act
		Topic createdTopic = topicServiceWithSpy.createTopic(newTopic, author);
		
		// assert - 4b) verify topic creation with spy and mock interactions
		assertNotNull(createdTopic, "created topic should not be null");
		assertTrue(createdTopic.getSlug().startsWith("advanced-java-programming"), "slug should start with formatted title");
		assertEquals(author, createdTopic.getAuthor(), "author should be set");
		assertEquals("newtopic123", createdTopic.getId(), "id should be assigned by repository");
		
		// verify mock repository interactions
		verify(topicRepository, atLeastOnce()).existsBySlug(anyString());
		verify(topicRepository).save(argThat(topic -> 
			topic.getSlug().startsWith("advanced-java-programming") &&
			author.equals(topic.getAuthor()) &&
			topic.getCreatedAt() != null
		));
		
		// 4b) verify spy gamification service was called - this demonstrates spy usage
		verify(spyGamificationService, times(1)).updateUserStatsOnTopicCreated(author);
		
		// verify no unexpected interactions
		verifyNoMoreInteractions(topicRepository);
		verifyNoMoreInteractions(spyGamificationService);
	}
}
