import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
    const [files, setFiles] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [position, setPosition] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [rankFilter, setRankFilter] = useState(null); // Filter for the "Rank" column

    // Fetch files from backend
    const fetchFiles = async () => {
        const response = await axios.get('http://localhost:5000/files');
        const fileDetails = response.data.map((file) => ({
            name: file.name,
            date: file.metadata.upload_date,
            position: file.metadata.position,
            rank: null, // Default rank
        }));
        setFiles(fileDetails);
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!uploadFile || !position) {
            alert('Please select a file and a position before uploading.');
            return;
        }
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('position', position);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                fetchFiles();
                setUploadFile(null);
                setPosition('');
                alert('File uploaded successfully.');
            }
        } catch (error) {
            console.error('Upload failed:', error.response ? error.response.data : error.message);
            alert('Failed to upload the file. Please try again.');
        }
    };

    // Handle table sorting
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const sortedFiles = [...files].sort((a, b) => {
        if (sortConfig.key === 'rank') {
            return sortConfig.direction === 'asc' ? (a.rank || 0) - (b.rank || 0) : (b.rank || 0) - (a.rank || 0);
        }
        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc'
                ? new Date(a.date) - new Date(b.date)
                : new Date(b.date) - new Date(a.date);
        }
        return sortConfig.direction === 'asc'
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });

    // Apply rank filter
    const filteredFiles = sortedFiles.filter((file) => {
        if (rankFilter === null) return true; // No filter applied
        return file.rank === rankFilter;
    });

    // Randomly assign ranks to files
    const randomizeRanks = () => {
        setFiles((prevFiles) =>
            prevFiles.map((file) => ({
                ...file,
                rank: Math.floor(Math.random() * 5) + 1, // Random rank between 1 and 5
            }))
        );
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Resume Manager</h1>

            <div style={styles.uploadSection}>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    style={styles.fileInput}
                />
                <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    style={styles.positionSelect}
                >
                    <option value="">Select Position</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Engineer">Engineer</option>
                    <option value="Developer">Developer</option>
                    <option value="Analyst">Analyst</option>
                </select>
                <button onClick={handleUpload} style={styles.uploadButton}>
                    Upload
                </button>
                <button onClick={randomizeRanks} style={styles.rankButton}>
                    Rank
                </button>
            </div>

            <div style={styles.filterSection}>
                <label style={styles.filterLabel}>Filter by Rank:</label>
                <select
                    value={rankFilter !== null ? rankFilter : ''}
                    onChange={(e) =>
                        setRankFilter(e.target.value === '' ? null : parseInt(e.target.value, 10))
                    }
                    style={styles.filterSelect}
                >
                    <option value="">Show All</option>
                    <option value="1">Rank 1</option>
                    <option value="2">Rank 2</option>
                    <option value="3">Rank 3</option>
                    <option value="4">Rank 4</option>
                    <option value="5">Rank 5</option>
                </select>
            </div>

            <h2 style={styles.subHeader}>Uploaded Files</h2>

            <table style={styles.table}>
                <thead>
                    <tr>
                        {['Name', 'Submission Date', 'Position', 'Rank'].map((col) => (
                            <th
                                key={col}
                                onClick={() => handleSort(col.toLowerCase().replace(' ', ''))}
                                style={styles.tableHeader}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredFiles.map((file) => (
                        <tr key={file.name} style={styles.tableRow}>
                            <td>{file.name}</td>
                            <td>{file.date}</td>
                            <td>{file.position}</td>
                            <td>{file.rank || 'Unranked'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#e6f7ff', // Light blue background
        borderRadius: '8px',
    },
    header: {
        textAlign: 'center',
        color: '#333',
    },
    uploadSection: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
    },
    filterSection: {
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    filterLabel: {
        fontWeight: 'bold',
    },
    filterSelect: {
        padding: '5px',
    },
    fileInput: {
        flex: 1,
    },
    positionSelect: {
        padding: '5px',
    },
    uploadButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    rankButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    subHeader: {
        color: '#444',
        marginBottom: '10px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '10px',
        cursor: 'pointer',
    },
    tableRow: {
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
    },
};