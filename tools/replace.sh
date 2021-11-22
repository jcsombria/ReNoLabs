#!/bin/sh
sed -i -e "s/\"permissions\":\"\([^\"]*\)\"/\"permissions\":[\"\1\"]/g" records.js 
sed -i -e "s/\"email\":\"\([^\"]*\)\"/\"emails\":[{\"value\":\"\1\"}]/g" records.js 