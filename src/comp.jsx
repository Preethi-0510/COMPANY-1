import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css"; 

export default function App() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 4;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const cities = useMemo(() => {
    const setCities = new Set(users.map((u) => u.address?.city));
    return ["All", ...Array.from(setCities).sort()];
  }, [users]);

  const filtered = useMemo(() => {
    let list = [...users];

    if (query) {
      const lowerQuery = query.toLowerCase();
      list = list.filter((u) =>
        (
          u.name +
          u.username +
          u.email +
          (u.company?.name || "")
        ).toLowerCase().includes(lowerQuery)
      );
    }

    if (cityFilter !== "All") {
      list = list.filter((u) => u.address?.city === cityFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "company") return (a.company?.name || "").localeCompare(b.company?.name || "");
      return 0;
    });

    return list;
  }, [users, query, cityFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  const handleCityChange = useCallback((e) => {
    setCityFilter(e.target.value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((e) => setSortBy(e.target.value), []);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">👤 Employee Directory</h1>

        <div className="controls">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search users..."
            aria-label="Search users"
          />

          <select value={cityFilter} onChange={handleCityChange} aria-label="Filter by city">
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={sortBy} onChange={handleSortChange} aria-label="Sort users">
            <option value="name">Sort by Name</option>
            <option value="company">Sort by Company</option>
          </select>
        </div>
      </header>

      {loading && <p>Loading users...</p>}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      {!loading && !error && paginated.length === 0 && <p>No users found.</p>}

      <main className="user-grid">
        {paginated.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-name">{user.name}</div>
            <div className="user-username">@{user.username}</div>
            <div className="user-info">
              <strong>Email:</strong> {user.email} <br />
              <strong>Phone:</strong> {user.phone} <br />
              <strong>Website:</strong>{" "}
              <a
                href={`http://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
              <br />
              <strong>Company:</strong> {user.company?.name} <br />
              <em>{user.company?.catchPhrase}</em> <br />
              <strong>Address:</strong> {user.address?.suite}, {user.address?.street},{" "}
              {user.address?.city} {user.address?.zipcode}
            </div>
          </div>
        ))}
      </main>

      {!loading && !error && (
        <footer className="pagination">
          <button
            disabled={page === 1}
            aria-label="Previous page"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            ← Previous
          </button>
          <div>Page {page} of {totalPages}</div>
          <button
            disabled={page === totalPages}
            aria-label="Next page"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next →
          </button>
        </footer>
      )}
    </div>
  );
}
