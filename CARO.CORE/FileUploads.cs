using FluentFTP;
using Microsoft.AspNetCore.Http;

namespace CARO.CORE
{
    public class FileUploads
    {
        private string credetencialts = "u551436692.jurissearch.com";
        private string password = "2051CCfirma1091#";
        private string servidor = "ccfirma.com";

        public async Task<string> UploadFileAsync(string ruta, IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
            {
                throw new ArgumentException("El archivo no puede ser nulo o vacío.", nameof(archivo));
            }


            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password),
                Config =
                {
                    DataConnectionType = FtpDataConnectionType.AutoPassive
                }
            };


            try
            {
                client.Connect();
                if (!client.DirectoryExists(ruta)) client.CreateDirectory(ruta);

                using (var stream = new MemoryStream())
                {
                    await archivo.CopyToAsync(stream);
                    stream.Position = 0;

                    string remoteFilePath = Path.Combine(ruta, archivo.FileName);
                    client.UploadStream(stream, remoteFilePath);

                    return ruta + '/' + archivo.FileName;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();
            }
        }
        public async Task<string> UploadEncryptedFileAsync(string ruta, IFormFile archivo, string password)
        {
            if (archivo == null || archivo.Length == 0)
            {
                throw new ArgumentException("El archivo no puede ser nulo o vacío.", nameof(archivo));
            }

            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("La contraseña es obligatoria para encriptar el archivo.", nameof(password));
            }

            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password)
            };
            client.Config.DataConnectionType = FtpDataConnectionType.PASV;

            try
            {
                client.Connect();
                if (!client.DirectoryExists(ruta)) client.CreateDirectory(ruta);

                using (var encryptedStream = await FileEncryptor.EncryptFileAsync(archivo, password))
                {
                    encryptedStream.Position = 0; 

                    string remoteFilePath = Path.Combine(ruta, archivo.FileName + ".enc");
                    client.UploadStream(encryptedStream, remoteFilePath);  

                    return ruta + '/' + archivo.FileName + ".enc";  
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error al subir el archivo: " + ex.Message);
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();
            }
        }
        public async Task DeleteDirectoryAsync(string ruta)
        {
            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password)      
            };
            client.Config.DataConnectionType = FtpDataConnectionType.PASV;

            try
            {
                client.Connect();
                if (client.FileExists(ruta)) client.DeleteFile(ruta);
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();
            }
        }
        public async Task<byte[]> DownloadFileAsync(string remotePath)
        {
            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password)
            };
            client.Config.DataConnectionType = FtpDataConnectionType.PASV;

            string tempFilePath = Path.GetTempFileName(); 

            try
            {
                client.Connect();
                await Task.Run(() => client.DownloadFile(tempFilePath, remotePath));

                byte[] fileBytes = await File.ReadAllBytesAsync(tempFilePath);
                return fileBytes;
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();
                if (File.Exists(tempFilePath)) File.Delete(tempFilePath);
            }
        }
        public async Task<Stream> ObtenerFile(string rutaCompletaArchivo)
        {
            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password)
            };
            client.Config.DataConnectionType = FtpDataConnectionType.PASV;

            try
            {
                client.Connect();

                if (!client.FileExists(rutaCompletaArchivo))
                {
                    throw new FileNotFoundException($"El archivo '{rutaCompletaArchivo}' no existe en el servidor FTP.");
                }

                var memoryStream = new MemoryStream();
                client.DownloadStream(memoryStream, rutaCompletaArchivo);

                memoryStream.Position = 0;
                return memoryStream; 
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();
            }
        }
    }
}
