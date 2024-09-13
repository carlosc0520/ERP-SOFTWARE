using static CARO.CORE.Structs.PaginationStructs;

namespace CARO.CORE.Services.Interfaces
{
    public interface IPaginationService
    {
        int GetRecordsPerDraw();
        int GetPage();
        string GetSearchValue();
        SentParameters GetSentParameters();
    }
}
