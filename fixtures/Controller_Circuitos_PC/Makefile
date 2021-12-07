CC	= gcc
LDFLAGS	= -L/usr/local/lib
LDLIBS= -lpthread -lm

c_controller:	$(OBJ)
	@echo [link]
	@$(CC) -o circuitos circuitos.c $(LDLIBS)

clean:
	@echo "[Clean]"
	@rm -f *.o
