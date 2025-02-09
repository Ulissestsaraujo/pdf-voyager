using AutoMapper;
using PdfVoyagerBackend.Models;

namespace PdfVoyagerBackend.Profiles;

public class MapperProfiles : Profile
{
    public MapperProfiles()
    {
        CreateMap<PdfMetadataRequest, PdfMetadata>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid().ToString()));
        ;
    }
}