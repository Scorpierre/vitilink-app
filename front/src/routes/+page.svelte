<script>
    let email = '';
    let password = '';
    let error = '';
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          })
        });
  
        if (!response.ok) {
          throw new Error('Invalid credentials');
        }
  
        const data = await response.json();
        // Si la connexion réussit, tu peux stocker le token ou gérer la redirection
        console.log(data);
      } catch (err) {
        error = err.message || 'Something went wrong';
      }
    };
  </script>
  
  <style>
    form {
      display: flex;
      flex-direction: column;
      max-width: 300px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 10px;
    }
  
    label {
      margin: 5px 0;
    }
  
    input {
      padding: 10px;
      margin: 5px 0;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  
    button {
      padding: 10px;
      margin-top: 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #45a049;
    }
  
    .error {
      color: red;
      margin-top: 10px;
    }
  </style>
  
  <h1>Login</h1>
  
  <form on:submit={handleSubmit}>
    <label for="email">Email:</label>
    <input type="email" id="email" bind:value={email} required />
    
    <label for="password">Password:</label>
    <input type="password" id="password" bind:value={password} required />
    
    <button type="submit">Login</button>
    
    {#if error}
      <div class="error">{error}</div>
    {/if}
  </form>