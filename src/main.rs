use std::env;
use std::fs::File;
use std::io::prelude::*;

fn main() -> Result<(), COMPErr> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        println!("Invalid arguments.");
        println!("Expecting a single COMP file as an argument.");
        std::process::exit(1);
    }
    let file_name = &args[1];
    let program = read_program(file_name)?;
    run(program)
}

fn read_program(file_name: &String) -> Result<String, COMPErr> {
    let mut file = File::open(file_name).map_err(|e| COMPErr { message: format!("Could not open file {}.", file_name) })?;
    let mut contents = String::new();
    file.read_to_string(&mut contents).map_err(|e| COMPErr { message: format!("Could not read file {}.", file_name) })?;
    Ok(contents)
}

#[derive(Debug)]
struct COMPErr { message: String }

enum StackValue {

}

fn run(program: String) -> Result<(), COMPErr> {
    let mut stack: Vec<StackValue> = Vec::new();

    println!("{}", program);
    Ok(())
}
