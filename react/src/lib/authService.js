import axios from 'axios';
import { BASE_URL } from "@components/utils.js";

export const register = async (username, password) => {
    return await axios.post(`${BASE_URL}/register`, { username, password });
};

export const login = async (username, password) => {
    const response = await axios.post(`${BASE_URL}/login`, { username, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        window.location.href = response.data.redirect_url || '/';  
    }
    return response.data;
};
export const secureFetch = async (path) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
	if (response.status !== 200) throw new Error(`Server error: ${response.statusText}`);
	return response.data;
};

export const secureOpen = async (path) => {
    const newTab = window.open("about:blank", "_blank");
    try {
        const response = await secureFetch(path);
		// const jsonString = JSON.stringify(response, null, 4);
        const blob = new Blob([JSON.stringify(response, null, 4)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
        newTab.location.href = url;

		newTab.onload = () => {
            URL.revokeObjectURL(url);
        };

		setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 5000); 
    } catch (error) {
        console.error("Failed to open in new tab:", error);
        newTab.close();
    }
};

export const secureDownload = async (path, format) => {
	const newTab = window.open("about:blank", "_blank");
	
	try {
	  const response = await secureFetch(path);
	  let blob;
	  if (format === 'json'){
		// const jsonString = ;
        blob = new Blob([JSON.stringify(response, null, 4)], { type: 'application/json' });
	  }
	  else {
	    blob = new Blob([response]);
	  }

	  const url = URL.createObjectURL(blob);
	  
	  const a = newTab.document.createElement('a');
	  a.href = url;
	  a.download = 'data.'+ format;
	  newTab.document.body.appendChild(a);
	  a.click();
	  
	  
	  setTimeout(() => {
		URL.revokeObjectURL(url);
		newTab.close();
	  }, 100);
	  
	} catch (error) {
	  console.error("Download failed:", error);
	  newTab.close();
	  throw error;
	}
  };
