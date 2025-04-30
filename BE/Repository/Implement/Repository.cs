using BusinessObject.Context;
using Microsoft.EntityFrameworkCore;
using Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Implement
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly CustomFlowerChainContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(CustomFlowerChainContext context, DbSet<T> dbSet) : this(context)
        {
            _dbSet = dbSet;

        }

        public Repository(CustomFlowerChainContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }
        public IQueryable<T> Entities => _context.Set<T>();

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            if (entities == null || !entities.Any())
            {
                throw new ArgumentException("The entities collection is null or empty.");
            }

            await _dbSet.AddRangeAsync(entities);
        }
        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }
        public void DeleteRange(IEnumerable<T> entities)
        {
            if (entities == null || !entities.Any())
            {
                throw new ArgumentException("The entities collection is null or empty.");
            }

            _dbSet.RemoveRange(entities);
        }
        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T> GetByIdAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Entity with id {id} was not found.");
            return entity;
        }
        public async Task<T> GetByIdAsync(Guid? id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException($"Entity with id {id} was not found.");
            return entity;
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }


    }
}
