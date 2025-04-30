using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Interface
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<T> GetRepo<T>() where T : class;
        IRepository<T> Repository<T>() where T : class;
        Task<int> CompleteAsync();
    }
}
