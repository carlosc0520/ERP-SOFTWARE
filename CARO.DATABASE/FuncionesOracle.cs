using Dapper;
using CARO.DATABASE.Configuracion;
using CARO.DATABASE.Helper;
using Oracle.ManagedDataAccess.Client;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CARO.DATABASE
{
    public static class FuncionesOracle
    {
        public static async Task<List<T>> EjecutarProcedimiento<T>(ConfigConexionBD conexionSql, string nombreProcedimiento, DynamicParameters parametros)
        {
            using (var conn = new OracleConnection(conexionSql.CadenaConexion))
            {
                conn.Open();
                try
                {
                    var enumerable = await conn.QueryAsync<T>(nombreProcedimiento, parametros, commandType: CommandType.StoredProcedure);
                    return enumerable.ToList();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
            }
        }
        public static async Task<int> EjecutarProcedimiento(ConfigConexionBD conexionSql, string nombreProcedimiento, DynamicParameters parametros = null)
        {
            using (var conn = new OracleConnection(conexionSql.CadenaConexion))
            {
                conn.Open();
                try
                {
                    var affectedRows = await conn.ExecuteAsync(nombreProcedimiento, parametros, commandType: CommandType.StoredProcedure);
                    return affectedRows;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
            }
        }
        public static async Task<T> EjecutarProcedimiento<T>(ConfigConexionBD conexionSql, string nombreProcedimiento, string variableRetorno, DynamicParameters parametros = null)
        {
            using (var conn = new OracleConnection(conexionSql.CadenaConexion))
            {
                conn.Open();
                try
                {
                    await conn.ExecuteAsync(nombreProcedimiento, parametros, commandType: CommandType.StoredProcedure);
                    var vRetorno = parametros.Get<T>(variableRetorno);
                    return vRetorno;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
            }
        }

        public static async Task<T> ObtenerPrimerRegistro<T>(ConfigConexionBD conexionSql, string nombreProcedimiento, DynamicParameters parametros = null)
        {
            using (var conn = new OracleConnection(conexionSql.CadenaConexion))
            {
                conn.Open();
                try
                {
                    var enumerable = await conn.QueryAsync<T>(nombreProcedimiento, parametros, commandType: CommandType.StoredProcedure);
                    return enumerable.FirstOrDefault();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
            }
        }
        public static async Task<Cursores<T1, T2>> ObtenerCursores<T1, T2>(ConfigConexionBD conexionSql, string nombreProcedimiento, DynamicParameters parametros = null)
        {
            using (var conn = new OracleConnection(conexionSql.CadenaConexion))
            {
                conn.Open();
                try
                {
                    var multi = await conn.QueryMultipleAsync(nombreProcedimiento, parametros, commandType: CommandType.StoredProcedure);

                    return new Cursores<T1, T2>()
                    {
                        Cursor1 = multi.Read<T1>().ToList(),
                        Cursor2 = multi.Read<T2>().ToList()
                    };
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
            }
        }
        public static async Task<Cursores<T1, T2, T3>> ObtenerCursores<T1, T2, T3>(ConfigConexionBD conexionSql, string nombreProcedimiento, DynamicParameters parametros = null)
        {
            using (var conn = new OracleConnection(conexionSql.CadenaConexion))
            {
                conn.Open();
                try
                {
                    var multi = await conn.QueryMultipleAsync(nombreProcedimiento, parametros, commandType: CommandType.StoredProcedure);

                    return new Cursores<T1, T2, T3>()
                    {
                        Cursor1 = multi.Read<T1>().ToList(),
                        Cursor2 = multi.Read<T2>().ToList(),
                        Cursor3 = multi.Read<T3>().ToList(),
                    };
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    conn.Close();
                }
            }
        }
    }
}
