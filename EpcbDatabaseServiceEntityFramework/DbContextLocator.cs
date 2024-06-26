using Microsoft.EntityFrameworkCore;

namespace EpcbDatabaseServiceEntityFramework
{
	public class DbContextLocator<TContext> : IDisposable
		where TContext : DbContext, new()
	{
		private TContext _dbContext;

		public TContext Current
		{
			get { return _dbContext; }
		}

		public DbContextLocator()
		{
			_dbContext = GetNew();
		}

		public virtual void Reset()
		{
			_dbContext.Dispose();
			_dbContext = GetNew();

			_dbContext.SaveChanges();
		}

		protected virtual TContext GetNew()
		{
			return new TContext();
		}

		public void Dispose()
		{
			_dbContext.Dispose();
		}
	}
}
