using static CARO.CORE.Structs.Select2Structs;

namespace CARO.CORE.Services.Interfaces
{
    public interface ISelect2Service
    {
        int GetCurrentPage();
        string GetQuery();
        string GetRequestType();
        string GetSearchTerm();
        RequestParameters GetRequestParameters();
    }
}
