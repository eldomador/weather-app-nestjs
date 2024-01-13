import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginDto } from './dto/login.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  // Test Suite Declaration: Describes a test suite for UserController
  // The variables userController and userService will be used across the tests

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          // Provide a mock value for the Mongoose model using getModelToken
          // Mock the methods findOne and save
          provide: getModelToken(UserEntity.name),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    // Obtain instances of UserController and UserService from the testing module
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  // Before Each Hook: Executed before each test in the suite
  // Creates a testing module with UserController as a controller and UserService as a provider
  // Mocks the Mongoose model methods findOne and save using jest.fn()
  // Obtains instances of UserController and UserService for use in tests

  describe('createUser', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword',
      };

      // Mock the createUser method of the UserService to return a mock user object
      // The mock user object includes an ID and an empty favorites array
      jest.spyOn(userService, 'createUser').mockImplementation(async () => {
        return {
          ...createUserDto,
          _id: 'mockUserId',
          favorites: [],
        } as UserEntity;
      });

      // Call the createUser method of the UserController and capture the result
      const result = await userController.createUser(createUserDto);

      // Assert that the returned result matches the expected values based on the mock user object
      expect(result.username).toEqual(createUserDto.username);
      expect(result.email).toEqual(createUserDto.email);
      expect(result.token).toBeDefined();
      expect(result.favorites).toEqual([]);
    });
  });

  // Test Case for createUser Method: Tests the createUser method of UserController
  // Creates a createUserDto object representing user input
  // Mocks the createUser method of UserService to return a mock user object
  // Calls the createUser method of UserController and asserts the expected result
  // Checks if the returned result includes the correct username, email, token, and favorites
});

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(UserEntity.name),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should authenticate a user and return user details with token', async () => {
      const loginDto: LoginDto = {
        email: 'testuser@example.com',
        password: 'testpassword',
      };

      // Mock the loginUser method of the UserService to return a mock user object
      // Include the required password property in the mock user object
      jest.spyOn(userService, 'loginUser').mockImplementation(async () => {
        return {
          email: loginDto.email,
          username: 'testuser',
          password: 'hashedPassword', // Include the password property
          _id: 'mockUserId',
          favorites: [],
        } as UserEntity;
      });

      const result = await userController.login(loginDto);

      // Assert that the returned result matches the expected values based on the mock user object
      expect(result.email).toEqual(loginDto.email);
      expect(result.username).toEqual('testuser');
      expect(result.token).toBeDefined();
      expect(result.favorites).toEqual([]);
    });
  });
});

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          // Provide a mock value for the Mongoose model using getModelToken
          // Mock the methods findOne, save, and updateOne
          provide: getModelToken(UserEntity.name),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('addFavorite', () => {
    it('should add a favorite location for the authenticated user', async () => {
      // Mock the authenticated user
      const authenticatedUser: UserEntity = {
        email: 'testuser@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        favorites: [],
      };

      // Mock the request object with the necessary properties for ExpressRequest
      const request: any = {
        user: authenticatedUser,
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        // Add other necessary properties as needed
      };

      // Mock the parameters for the addFavorite method
      const locationToAdd = 'New York';

      // Mock the UserService method to return an updated user with the added favorite location
      jest.spyOn(userService, 'addFavorite').mockImplementation(async () => {
        authenticatedUser.favorites.push(locationToAdd);
        return authenticatedUser;
      });

      // Call the addFavorite method of the UserController and capture the result
      const result = await userController.addFavorite(request, locationToAdd);

      // Assert that the returned result matches the expected values based on the updated user
      expect(result.email).toEqual(authenticatedUser.email);
      expect(result.username).toEqual(authenticatedUser.username);
      expect(result.favorites).toEqual(authenticatedUser.favorites);
      expect(result.token).toBeDefined(); // Assuming the token is returned as well
    });
  });
});
