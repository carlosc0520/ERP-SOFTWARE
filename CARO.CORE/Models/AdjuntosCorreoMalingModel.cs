using Microsoft.AspNetCore.Http;

namespace CARO.CORE.Models
{
    public class AdjuntosCorreoMalingModel
    {
        public string? INDEX { get; set; } = null;
        public string? TYPE { get; set; } = null;
        public string? URL { get; set; } = null;
        public string? TEXT { get; set; } = null;
        public string? URLIMG { get; set; } = null;
        public string? URIIMG { get; set; } = null; // 👈 URL pública completa (para HTML)
        public IFormFile? FILE { get; set; } = null;
    }

    public class ImagenesWrapper
    {
        public List<AdjuntosCorreoMalingModel> imagenes { get; set; }
    }

    public class DestinatarioModel
    {
        public string DESTINATARIO { get; set; }
    }

}
