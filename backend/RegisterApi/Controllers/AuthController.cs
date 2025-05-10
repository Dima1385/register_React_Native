using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RegisterApi.Data;
using RegisterApi.Models;
using RegisterApi.Services;

namespace RegisterApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ApplicationDbContext context, 
            TokenService tokenService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            _logger.LogInformation("Received registration request for email: {Email}", request.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid registration data");
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Невірні дані! Перевірте введену інформацію та спробуйте знову."
                });
            }

            
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                _logger.LogWarning("User with email {Email} already exists", request.Email);
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Користувач з такою електронною поштою вже існує. Використайте іншу адресу або спробуйте увійти."
                });
            }

            try
            {
                
                var user = new User
                {
                    Name = request.Name,
                    Email = request.Email,
                    Password = request.Password 
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                
                var token = _tokenService.GenerateJwtToken(user);

                _logger.LogInformation("User {Email} registered successfully", user.Email);

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = $"Реєстрація успішна! Вітаємо, {user.Name}! Ваш обліковий запис створено та додано до бази даних.",
                    Token = token,
                    User = new UserDto
                    {
                        Name = user.Name,
                        Email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user {Email}", request.Email);
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "Сталася помилка при створенні облікового запису. Будь ласка, спробуйте пізніше."
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            _logger.LogInformation("Received login request for email: {Email}", request.Email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid login data");
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Невірні дані! Перевірте введену інформацію та спробуйте знову."
                });
            }

            try
            {
                
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && 
                                            u.Password == request.Password); 

                if (user == null)
                {
                    _logger.LogWarning("Invalid login attempt for {Email}", request.Email);
                    return Unauthorized(new AuthResponse
                    {
                        Success = false,
                        Message = "Невірна електронна пошта або пароль. Перевірте дані та спробуйте знову."
                    });
                }

                
                var token = _tokenService.GenerateJwtToken(user);

                _logger.LogInformation("User {Email} logged in successfully", user.Email);

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = $"Вхід успішний! Вітаємо, {user.Name}! Раді бачити вас знову.",
                    Token = token,
                    User = new UserDto
                    {
                        Name = user.Name,
                        Email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", request.Email);
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "Сталася помилка при вході. Будь ласка, спробуйте пізніше."
                });
            }
        }

        [HttpGet("user/{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            _logger.LogInformation("Received request for user data with email: {Email}", email);

            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

                if (user == null)
                {
                    _logger.LogWarning("User with email {Email} not found", email);
                    return NotFound(new { Message = "Користувач не знайдений" });
                }

                _logger.LogInformation("Retrieved user data for {Email}", email);

                return Ok(new UserDto
                {
                    Name = user.Name,
                    Email = user.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email {Email}", email);
                return StatusCode(500, new { Message = "Внутрішня помилка сервера" });
            }
        }

        
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllUsers()
        {
            _logger.LogWarning("Received request to clear all users from database");

            try
            {
                var users = await _context.Users.ToListAsync();
                _context.Users.RemoveRange(users);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully removed {Count} users from database", users.Count);

                return Ok(new 
                { 
                    Success = true, 
                    Message = $"Успішно видалено {users.Count} користувачів з бази даних",
                    Count = users.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing users from database");
                return StatusCode(500, new 
                { 
                    Success = false, 
                    Message = "Сталася помилка при очищенні бази даних"
                });
            }
        }
    }
} 