
// Clase que dibuja los ejes
class AxesDrawer {
	constructor()
	{
		// 1. Compilamos el programa de shaders
		this.prog = InitShaderProgram( axisVS, axisFS );
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.vertPos  = gl.getAttribLocation( this.prog, 'pos' );
		this.colorPos = gl.getAttribLocation( this.prog, 'color' );
		 
		// 4. Creamos el buffer para los vertices		
		this.vertBuffer  = gl.createBuffer();
		this.colorBuffer = gl.createBuffer();


        // 3 ejes unitarios
		var pos = [
			-1, -1, -1,
			 1, -1, -1,
			-1, -1, -1,
			-1,  1, -1,
			-1, -1, -1,
			-1, -1,  1
		];

		var colors = [
			1, 0, 0,
			1, 0, 0,
			0, 1, 0,
			0, 1, 0,
			0, 0, 1,
			0, 0, 1
		]

		this.numLines = pos.length / 3 / 2;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	}

    // Esta función se llama para dibujar la caja
	draw( trans )
	{
        // 1. Seleccionamos el shader
		gl.useProgram( this.prog );

        // 2. Setear matriz de transformacion
		gl.uniformMatrix4fv( this.mvp, false, trans );

        // 3.Binding del buffer de posiciones
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );

        // 4. Habilitamos el atributo 
		gl.vertexAttribPointer( this.vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPos );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
		gl.vertexAttribPointer( this.colorPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.colorPos );
		
        // 5. Dibujamos
		gl.drawArrays( gl.LINES, 0, this.numLines * 2 );
	}
}
// Vertex shader 
var axisVS = `
	attribute vec3 pos;
	attribute vec3 color;

	uniform mat4 mvp;

	varying vec4 fragmentColor;

	void main()
	{
		fragmentColor = vec4(color, 1);
		gl_Position = mvp * vec4(pos,1);
	}
`;
// Fragment shader 
var axisFS = `
	precision mediump float;

	varying vec4 fragmentColor;

	void main()
	{
		gl_FragColor = fragmentColor;
	}
`;
