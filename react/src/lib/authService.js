import axios from 'axios';
import { BASE_URL } from "@components/utils.js";


export const login = async (username, password) => {
    const response = await axios.post(`${BASE_URL}/login`, { username, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        window.location.href = response.data.redirect_url || '/dashboard';  
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

export const secureOpen = async (path, format) => {
	const newTab = window.open("about:blank", "_blank");
	
	try {
	  const response = await secureFetch(path);
	  let blob;
	  if (format === 'json' || format === 'raw'){
        blob = new Blob([JSON.stringify(response, null, 4)], { type: 'application/json' });
	  }
	  else {
	    blob = new Blob([response]);
	  }
	  const url = URL.createObjectURL(blob);
	  
	  if (format !== 'raw'){
	  const a = newTab.document.createElement('a');
	  a.href = url;
	  a.download = 'data.'+ format;
	  newTab.document.body.appendChild(a);
	  a.click();
	  
	  
	  setTimeout(() => {
		URL.revokeObjectURL(url);
		newTab.close();
	  }, 100);
	}
	else {
		newTab.location.href = url;

		newTab.onload = () => {
            URL.revokeObjectURL(url);
        };

		setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 5000);
	}
	  
	} catch (error) {
	  console.error("Download failed:", error);
	  newTab.close();
	  throw error;
	}
  };





  