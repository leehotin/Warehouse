main();

function main(){
    const counterElement = document.querySelector('body');
    createCounter(counterElement);
}
function createCounter(element, options={}){
    const {initialCount = 60, interval = 1000 } = options ;
    let counter = 0, timer ;
    const setCounter = (count)=>{
        counter = count ;
        render();
    }
    const render = ()=> {
        element.innerHTML = `將在${counter}秒後跳轉` ;
    }
    setCounter(initialCount)
    timer = setInterval(()=>{
        if(counter <= 0){
            return clearInterval(timer);
        }
        setCounter(counter - 1);        
    }, interval);
}