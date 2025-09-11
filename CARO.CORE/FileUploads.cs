using FluentFTP;
using FluentFTP.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO.Compression;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CARO.CORE
{
    public class FileUploads
    {
        private string credetencialts = "devcar0520";
        private string password = "ING052001";
        private string servidor = "win8168.site4now.net";

        //private string credetencialts = "u551436692.jurisFiles";
        //private string password = "jurisFiles123$";
        //private string servidor = "jurissearch.com";
        private string api = "http://localhost:3000/complytools";

        //private string credetencialts = "devbussinnes-001";
        //private string password = "ING052001";
        //private string servidor = "win1083.site4now.net";
        public async Task<string> UploadFilesAPIAsync(List<IFormFile> files, string remotePath)
        {
            if (files == null || files.Count == 0)
            {
                throw new Exception("No files provided");
            }

            using (var client = new HttpClient())
            using (var content = new MultipartFormDataContent())
            {
                foreach (var file in files)
                {
                    using (var stream = new MemoryStream())
                    {
                        await file.CopyToAsync(stream);
                        var fileContent = new ByteArrayContent(stream.ToArray());
                        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse(file.ContentType);
                        content.Add(fileContent, "files", file.FileName);
                    }
                }
                content.Add(new StringContent(remotePath), "remotePath");

                var response = await client.PostAsync($"{this.api}/upload", content);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
        }

        public async Task<byte[]> DownloadFilesAPIAsync(List<string> fileNames)
        {
            if (fileNames == null || fileNames.Count == 0)
            {
                throw new Exception("No file names provided");
            }

            using (var client = new HttpClient())
            {
                var json = JsonSerializer.Serialize(new { fileNames });
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{this.api}/download", content);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsByteArrayAsync();
            }
        }

        public async Task<string> DeleteFilesAPIAsync(List<string> filePaths)
        {
            if (filePaths == null || filePaths.Count == 0)
            {
                throw new Exception("No file paths provided");
            }

            using (var client = new HttpClient())
            {
                var json = JsonSerializer.Serialize(new { filePaths });
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var request = new HttpRequestMessage
                {
                    Method = HttpMethod.Delete,
                    RequestUri = new Uri($"{this.api}/delete"),
                    Content = content
                };

                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
        }


        public async Task<string> UploadFileAsync(string ruta, IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
            {
                throw new ArgumentException("El archivo no puede ser nulo o vacío.", nameof(archivo));
            }


            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password),
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

        public async Task<string> UploadFilesAsync(string ruta, List<IFormFile> archivos, bool gui = true)
        {
            if (archivos == null || archivos.Count == 0)
            {
                throw new ArgumentException("La lista de archivos no puede ser nula o vacía.", nameof(archivos));
            }

            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password),
                Config =
                {
                    ValidateAnyCertificate = true,
                    //EncryptionMode = FtpEncryptionMode.Explicit, // FTPS Explicito (usa Implicit si es necesario)
                    //DataConnectionType = FtpDataConnectionType.AutoPassive, // Cambia a Active si el servidor lo requiere
          
                }
            };

            List<string> rutasSubidas = new List<string>();
            List<string> archivosLocales = new List<string>();

            try
            {
                client.Config.ValidateAnyCertificate = true;
                client.Connect();

                if (!client.DirectoryExists(ruta))
                {
                    client.CreateDirectory(ruta);
                }

                foreach (var archivo in archivos)
                {
                    string gui_uni = $"{Guid.NewGuid():N}";
                    string uniqueFileName = gui ? $"{Guid.NewGuid():N}_{archivo.FileName}" : archivo.FileName;
                    string tempFilePath = Path.Combine(Path.GetTempPath(), uniqueFileName);

                    using (var stream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write))
                    {
                        await archivo.CopyToAsync(stream);
                    }

                    archivosLocales.Add(tempFilePath);
                    rutasSubidas.Add($"{ruta}/{uniqueFileName}");
                }

                // Subir todos los archivos de una vez
                await Task.Run(() => client.UploadFiles(archivosLocales, ruta, FtpRemoteExists.Overwrite, true));

                return string.Join(",", rutasSubidas);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al subir archivos: " + ex.Message, ex);
            }
            finally
            {
                if (client.IsConnected)
                {
                    client.Disconnect();
                }

                // Eliminar archivos temporales
                foreach (var file in archivosLocales)
                {
                    if (File.Exists(file))
                    {
                        File.Delete(file);
                    }
                }
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

        public async Task<FileContentResult> DownloadFilesAsync(string rutasCompletas)
        {
            if (string.IsNullOrWhiteSpace(rutasCompletas))
            {
                throw new ArgumentException("No se han proporcionado rutas de archivos.");
            }

            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password),
                Config =
                {
                    DataConnectionType = FtpDataConnectionType.AutoPassive
                }
            };


            string zipFileName = $"Archivos_{DateTime.Now:yyyyMMddHHmmss}.zip";
            string zipFilePath = Path.Combine(Path.GetTempPath(), zipFileName);

            List<string> archivosLocales = new List<string>();

            try
            {
                client.Connect();

                var rutas = rutasCompletas.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Select(ruta => ruta.Trim())
                                          .ToList();

                foreach (var ruta in rutas)
                {
                    string tempFilePath = Path.Combine(Path.GetTempPath(), Path.GetFileName(ruta));

                    await Task.Run(() => client.DownloadFile(tempFilePath, ruta));

                    archivosLocales.Add(tempFilePath);
                }

                using (var zipStream = new FileStream(zipFilePath, FileMode.Create))
                using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                {
                    foreach (var archivo in archivosLocales)
                    {
                        zipArchive.CreateEntryFromFile(archivo, Path.GetFileName(archivo));
                    }
                }

                var zipBytes = await File.ReadAllBytesAsync(zipFilePath);

                return new FileContentResult(zipBytes, "application/zip")
                {
                    FileDownloadName = zipFileName
                };
            }
            catch (FtpException ftpEx)
            {
                throw new Exception($"Error FTP: {ftpEx.Message} | StackTrace: {ftpEx.StackTrace}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error en la descarga: {ex.Message} | StackTrace: {ex.StackTrace}");
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();

                foreach (var file in archivosLocales)
                {
                    if (File.Exists(file)) File.Delete(file);
                }

                if (File.Exists(zipFilePath)) File.Delete(zipFilePath);
            }
        }

        public async Task<List<FileContentResult>> DownloadMultipleFilesAsync(string rutasCompletas)
        {
            if (string.IsNullOrWhiteSpace(rutasCompletas))
            {
                throw new ArgumentException("No se han proporcionado rutas de archivos.");
            }

            var client = new FtpClient(this.servidor, 21)
            {
                Credentials = new System.Net.NetworkCredential(this.credetencialts, this.password),
                Config =
        {
            DataConnectionType = FtpDataConnectionType.AutoPassive
        }
            };

            List<FileContentResult> archivosDescargados = new List<FileContentResult>();
            List<string> archivosLocales = new List<string>();

            try
            {
                client.Connect();

                var rutas = rutasCompletas.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Select(ruta => ruta.Trim())
                                          .ToList();

                foreach (var ruta in rutas)
                {
                    string tempFilePath = Path.Combine(Path.GetTempPath(), Path.GetFileName(ruta));

                    await Task.Run(() => client.DownloadFile(tempFilePath, ruta));

                    archivosLocales.Add(tempFilePath);

                    // Leer el archivo descargado
                    byte[] fileBytes = await File.ReadAllBytesAsync(tempFilePath);
                    string contentType = "application/octet-stream"; // Puedes mejorar esto detectando el tipo MIME.

                    archivosDescargados.Add(new FileContentResult(fileBytes, contentType)
                    {
                        FileDownloadName = Path.GetFileName(ruta)
                    });
                }

                return archivosDescargados;
            }
            catch (FtpException ftpEx)
            {
                throw new Exception($"Error FTP: {ftpEx.Message} | StackTrace: {ftpEx.StackTrace}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error en la descarga: {ex.Message} | StackTrace: {ex.StackTrace}");
            }
            finally
            {
                if (client.IsConnected) client.Disconnect();

                foreach (var file in archivosLocales)
                {
                    if (File.Exists(file)) File.Delete(file);
                }
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
