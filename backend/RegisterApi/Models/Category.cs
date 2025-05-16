using System.ComponentModel.DataAnnotations;

namespace RegisterApi.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [MaxLength(500)]
        public string ImageUrl { get; set; }
    }
} 