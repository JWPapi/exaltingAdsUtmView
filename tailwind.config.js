module.exports = {
    content : [
        './pages/*.js',
        './components/*.js',
        './elements/*.js',
        './elements/**/*.js',
        './layout/**/*.js',
        './pages/**/*.js'
    ],
    plugins : [
        require('@tailwindcss/forms'),
        require('daisyui')
    ],
    daisyui : {
        themes : [
            {
                mytheme : {
                    'primary' : '#998653',
                    'accent' : '#F7FFDD',
                    'base-100' : '#353535',
                    'info' : '#B4ADEA',
                    'error' : '#D81E5B'
                }
            }
        ]
    }
}
