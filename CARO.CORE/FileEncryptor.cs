using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;
using System.Text;

namespace CARO.CORE
{
    public class FileEncryptor
    {
        public static async Task<MemoryStream> EncryptFileAsync(IFormFile archivo, string password)
        {
            using (var memoryStream = new MemoryStream())
            {
                await archivo.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                var encryptedData = EncryptData(memoryStream.ToArray(), password);

                var encryptedMemoryStream = new MemoryStream(encryptedData);
                return encryptedMemoryStream;
            }
        }

        private static byte[] EncryptData(byte[] data, string password)
        {
            using (var aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(password.Substring(0, 16)); // Aseguramos que la clave tenga 16 bytes
                aesAlg.IV = new byte[16];  // Usamos un IV de 16 bytes, puede ser generado aleatoriamente si se desea

                using (var encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV))
                using (var memoryStream = new MemoryStream())
                using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                {
                    cryptoStream.Write(data, 0, data.Length);
                    cryptoStream.FlushFinalBlock();
                    return memoryStream.ToArray();
                }
            }
        }

        public static byte[] DecryptData(byte[] encryptedData, string password)
        {
            using (var aesAlg = Aes.Create())
            {
                aesAlg.Key = Encoding.UTF8.GetBytes(password.Substring(0, 16)); 
                aesAlg.IV = new byte[16]; 

                using (var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV))
                using (var memoryStream = new MemoryStream(encryptedData))
                using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                using (var resultStream = new MemoryStream())
                {
                    cryptoStream.CopyTo(resultStream);
                    return resultStream.ToArray();
                }
            }
        }

        public string GenerateRandomString(int length = 16)
        {
            const string validChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            var result = new char[length];

            for (int i = 0; i < length; i++)
            {
                result[i] = validChars[random.Next(validChars.Length)];
            }

            return new string(result);
        }

    }
}
