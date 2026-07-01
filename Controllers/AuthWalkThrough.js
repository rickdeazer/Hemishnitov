const AuthWalk = (req,data,rdOnError,from,to)=>{
  req.redirectOnError = rdOnError == "default"? "MMUNerror" : rdOnError; //page to redirect to when there is an auth error
  req.data = data;// object body of the page redirected to
  req.from = from;//Caller function not executed
  data.takeBack = to;//Page to take user to when logged back in
}

export {AuthWalk};